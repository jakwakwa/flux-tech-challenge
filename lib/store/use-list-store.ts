import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { listService } from "@/lib/services/list-service";
import type { List } from "@/lib/types";

interface TaskCount {
	total: number;
	completed: number;
}

interface ListWithTaskCounts extends List {
	taskCounts?: TaskCount;
}

interface ListState {
	// Data
	lists: ListWithTaskCounts[];
	selectedListId: string | null;

	// Task count tracking
	taskCounts: Record<string, TaskCount>;

	// UI State
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: Record<string, boolean>;
	isDeleting: Record<string, boolean>;
	error: string | null;
	hasBeenModified: boolean; // Track if store has been actively used

	// Pagination
	totalPages: number;
	currentPage: number;
	totalCount: number;

	// Search & Filter
	searchQuery: string;
	sortBy: "createdAt" | "updatedAt" | "title";
	sortOrder: "asc" | "desc";

	// Actions
	fetchLists: (page?: number) => Promise<void>;
	createList: (title: string) => Promise<List | null>;
	updateList: (id: string, title: string) => Promise<void>;
	deleteList: (id: string) => Promise<void>;
	selectList: (id: string | null) => void;

	// Task count management
	incrementTaskCount: (listId: string, isCompleted?: boolean) => void;
	decrementTaskCount: (listId: string, isCompleted?: boolean) => void;
	updateTaskCompletion: (
		listId: string,
		wasCompleted: boolean,
		isCompleted: boolean,
	) => void;
	setTaskCounts: (listId: string, counts: TaskCount) => void;
	initializeTaskCounts: (
		lists: Array<{ id: string; tasks?: Array<{ completed: boolean }> }>,
	) => void;

	// UI Actions
	setSearchQuery: (query: string) => void;
	setSortBy: (sortBy: ListState["sortBy"]) => void;
	setSortOrder: (order: ListState["sortOrder"]) => void;
	clearError: () => void;

	// Utilities
	getListById: (id: string) => ListWithTaskCounts | undefined;
	getSelectedList: () => ListWithTaskCounts | undefined;
	getTaskCounts: (listId: string) => TaskCount;
}

export const useListStore = create<ListState>()(
	devtools(
		subscribeWithSelector(
			immer((set, get) => ({
				// Initial state
				lists: [],
				selectedListId: null,
				taskCounts: {},
				isLoading: false,
				isCreating: false,
				isUpdating: {},
				isDeleting: {},
				error: null,
				hasBeenModified: false,
				totalPages: 1,
				currentPage: 1,
				totalCount: 0,
				searchQuery: "",
				sortBy: "createdAt",
				sortOrder: "desc",

				// Fetch lists with pagination and search
				fetchLists: async (page = 1) => {
					set((state) => {
						state.isLoading = true;
						state.error = null;
						state.hasBeenModified = true; // Mark as modified
					});

					try {
						const { searchQuery, sortBy, sortOrder } = get();
						const response = await listService.getLists({
							page,
							search: searchQuery,
							sortBy,
							sortOrder,
						});

						set((state) => {
							state.lists = response.data;
							state.totalPages = response.totalPages;
							state.currentPage = response.page;
							state.totalCount = response.total;
							state.isLoading = false;
						});
					} catch (error) {
						set((state) => {
							state.error =
								error instanceof Error
									? error.message
									: "Failed to fetch lists";
							state.isLoading = false;
						});
					}
				},

				// Create list with optimistic update
				createList: async (title: string) => {
					const tempId = `temp-${Date.now()}`;
					const optimisticList: List = {
						id: tempId,
						title,
						userId: "temp",
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					set((state) => {
						state.isCreating = true;
						state.error = null;
						state.hasBeenModified = true; // Mark as modified
						// Optimistically add the list
						state.lists.unshift(optimisticList);
					});

					try {
						const newList = await listService.createList({ title });

						set((state) => {
							// Replace optimistic list with real one
							const index = state.lists.findIndex((l) => l.id === tempId);
							if (index !== -1) {
								state.lists[index] = newList;
							}
							state.isCreating = false;
						});

						return newList;
					} catch (error) {
						set((state) => {
							// Remove optimistic list on error
							state.lists = state.lists.filter((l) => l.id !== tempId);
							state.error =
								error instanceof Error
									? error.message
									: "Failed to create list";
							state.isCreating = false;
						});
						return null;
					}
				},

				// Update list with optimistic update
				updateList: async (id: string, title: string) => {
					const originalList = get().lists.find((l) => l.id === id);
					if (!originalList) return;

					set((state) => {
						state.isUpdating[id] = true;
						state.error = null;
						// Optimistically update
						const list = state.lists.find((l) => l.id === id);
						if (list) {
							list.title = title;
							list.updatedAt = new Date();
						}
					});

					try {
						await listService.updateList(id, { title });

						set((state) => {
							state.isUpdating[id] = false;
						});
					} catch (error) {
						set((state) => {
							// Revert on error
							const list = state.lists.find((l) => l.id === id);
							if (list && originalList) {
								list.title = originalList.title;
								list.updatedAt = originalList.updatedAt;
							}
							state.error =
								error instanceof Error
									? error.message
									: "Failed to update list";
							state.isUpdating[id] = false;
						});
					}
				},

				// Delete list with optimistic update
				deleteList: async (id: string) => {
					const originalList = get().lists.find((l) => l.id === id);
					const originalIndex = get().lists.findIndex((l) => l.id === id);

					set((state) => {
						state.isDeleting[id] = true;
						state.error = null;
						state.hasBeenModified = true; // Mark as modified
						// Optimistically remove
						state.lists = state.lists.filter((l) => l.id !== id);
						// Clear selection if deleted list was selected
						if (state.selectedListId === id) {
							state.selectedListId = null;
						}
					});

					try {
						await listService.deleteList(id);

						set((state) => {
							delete state.isDeleting[id];
						});
					} catch (error) {
						set((state) => {
							// Restore on error
							if (originalList && originalIndex !== -1) {
								state.lists.splice(originalIndex, 0, originalList);
							}
							state.error =
								error instanceof Error
									? error.message
									: "Failed to delete list";
							delete state.isDeleting[id];
						});
					}
				},

				// UI Actions
				selectList: (id) =>
					set((state) => {
						state.selectedListId = id;
					}),

				setSearchQuery: (query) =>
					set((state) => {
						state.searchQuery = query;
					}),

				setSortBy: (sortBy) =>
					set((state) => {
						state.sortBy = sortBy;
					}),

				setSortOrder: (order) =>
					set((state) => {
						state.sortOrder = order;
					}),

				clearError: () =>
					set((state) => {
						state.error = null;
					}),

				// Task count management
				incrementTaskCount: (listId, isCompleted = false) =>
					set((state) => {
						if (!state.taskCounts[listId]) {
							state.taskCounts[listId] = { total: 0, completed: 0 };
						}
						state.taskCounts[listId].total += 1;
						if (isCompleted) {
							state.taskCounts[listId].completed += 1;
						}
					}),

				decrementTaskCount: (listId, isCompleted = false) =>
					set((state) => {
						if (!state.taskCounts[listId]) {
							state.taskCounts[listId] = { total: 0, completed: 0 };
						}
						state.taskCounts[listId].total = Math.max(
							0,
							state.taskCounts[listId].total - 1,
						);
						if (isCompleted) {
							state.taskCounts[listId].completed = Math.max(
								0,
								state.taskCounts[listId].completed - 1,
							);
						}
					}),

				updateTaskCompletion: (listId, wasCompleted, isCompleted) =>
					set((state) => {
						if (!state.taskCounts[listId]) {
							state.taskCounts[listId] = { total: 0, completed: 0 };
						}
						if (wasCompleted && !isCompleted) {
							// Task was completed, now uncompleted
							state.taskCounts[listId].completed = Math.max(
								0,
								state.taskCounts[listId].completed - 1,
							);
						} else if (!wasCompleted && isCompleted) {
							// Task was uncompleted, now completed
							state.taskCounts[listId].completed += 1;
						}
					}),

				setTaskCounts: (listId, counts) =>
					set((state) => {
						state.taskCounts[listId] = { ...counts };
					}),

				initializeTaskCounts: (lists) =>
					set((state) => {
						lists.forEach((list) => {
							if (list.tasks) {
								const totalTasks = list.tasks.length;
								const completedTasks = list.tasks.filter(
									(t) => t.completed,
								).length;
								state.taskCounts[list.id] = {
									total: totalTasks,
									completed: completedTasks,
								};
							}
						});
					}),

				// Utilities
				getListById: (id) => get().lists.find((l) => l.id === id),

				getSelectedList: () => {
					const { selectedListId, lists } = get();
					return selectedListId
						? lists.find((l) => l.id === selectedListId)
						: undefined;
				},

				getTaskCounts: (listId) => {
					const { taskCounts } = get();
					return taskCounts[listId] || { total: 0, completed: 0 };
				},
			})),
		),
		{
			name: "list-store",
		},
	),
);
