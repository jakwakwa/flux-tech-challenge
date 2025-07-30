import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { taskService } from "@/lib/services/task-service";
import type { SearchFilters, Task, UpdateTaskRequest } from "@/lib/types";

interface TaskState {
	// Data
	tasks: Task[];

	// UI State
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: Record<string, boolean>;
	isDeleting: Record<string, boolean>;
	error: string | null;

	// Pagination
	totalPages: number;
	currentPage: number;
	totalCount: number;

	// Search & Filter
	searchQuery: string;
	filters: SearchFilters;

	// Actions
	fetchTasks: (page?: number) => Promise<void>;
	createTask: (data: {
		title: string;
		description?: string;
		listId: string;
	}) => Promise<Task | null>;
	updateTask: (id: string, data: Partial<Task>) => Promise<void>;
	deleteTask: (id: string) => Promise<void>;
	toggleTaskComplete: (id: string) => Promise<void>;

	// Bulk Actions
	deleteCompletedTasks: (listId?: string) => Promise<void>;
	markAllAsComplete: (listId?: string) => Promise<void>;

	// UI Actions
	setSearchQuery: (query: string) => void;
	setFilters: (filters: Partial<SearchFilters>) => void;
	clearFilters: () => void;
	clearError: () => void;

	// Utilities
	getTaskById: (id: string) => Task | undefined;
	getTasksByListId: (listId: string) => Task[];
	getFilteredTasks: () => Task[];
	getTaskStats: () => { total: number; completed: number; pending: number };
}

export const useTaskStore = create<TaskState>()(
	devtools(
		subscribeWithSelector(
			immer((set, get) => ({
				// Initial state
				tasks: [],
				isLoading: false,
				isCreating: false,
				isUpdating: {},
				isDeleting: {},
				error: null,
				totalPages: 1,
				currentPage: 1,
				totalCount: 0,
				searchQuery: "",
				filters: {
					listId: undefined,
					completed: undefined,
					sortBy: "createdAt",
					sortOrder: "desc",
				},

				// Fetch tasks with pagination and filters
				fetchTasks: async (page = 1) => {
					set((state) => {
						state.isLoading = true;
						state.error = null;
					});

					try {
						const { searchQuery, filters } = get();
						const response = await taskService.getTasks({
							page,
							search: searchQuery,
							...filters,
						});

						set((state) => {
							state.tasks = response.data;
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
									: "Failed to fetch tasks";
							state.isLoading = false;
						});
					}
				},

				// Create task with optimistic update
				createTask: async (data) => {
					const tempId = `temp-${Date.now()}`;
					const optimisticTask: Task = {
						id: tempId,
						title: data.title,
						description: data.description || null,
						completed: false,
						listId: data.listId,
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					set((state) => {
						state.isCreating = true;
						state.error = null;
						// Optimistically add the task
						state.tasks.unshift(optimisticTask);
						state.totalCount += 1;
					});

					try {
						const newTask = await taskService.createTask(data);

						set((state) => {
							// Replace optimistic task with real one
							const index = state.tasks.findIndex((t) => t.id === tempId);
							if (index !== -1) {
								state.tasks[index] = newTask;
							}
							state.isCreating = false;
						});

						return newTask;
					} catch (error) {
						set((state) => {
							// Remove optimistic task on error
							state.tasks = state.tasks.filter((t) => t.id !== tempId);
							state.totalCount -= 1;
							state.error =
								error instanceof Error
									? error.message
									: "Failed to create task";
							state.isCreating = false;
						});
						return null;
					}
				},

				// Update task with optimistic update
				updateTask: async (id, data) => {
					const originalTask = get().tasks.find((t) => t.id === id);
					if (!originalTask) return;

					set((state) => {
						state.isUpdating[id] = true;
						state.error = null;
						// Optimistically update
						const task = state.tasks.find((t) => t.id === id);
						if (task) {
							Object.assign(task, data);
							task.updatedAt = new Date();
						}
					});

					try {
						// Convert null to undefined for API compatibility
						const updateData: UpdateTaskRequest = {
							...data,
							description:
								data.description === null ? undefined : data.description,
						};
						await taskService.updateTask(id, updateData);

						set((state) => {
							state.isUpdating[id] = false;
						});
					} catch (error) {
						set((state) => {
							// Revert on error
							const taskIndex = state.tasks.findIndex((t) => t.id === id);
							if (taskIndex !== -1 && originalTask) {
								state.tasks[taskIndex] = originalTask;
							}
							state.error =
								error instanceof Error
									? error.message
									: "Failed to update task";
							state.isUpdating[id] = false;
						});
					}
				},

				// Toggle task completion
				toggleTaskComplete: async (id) => {
					const task = get().tasks.find((t) => t.id === id);
					if (!task) return;

					await get().updateTask(id, { completed: !task.completed });
				},

				// Delete task with optimistic update
				deleteTask: async (id) => {
					const originalTask = get().tasks.find((t) => t.id === id);
					const originalIndex = get().tasks.findIndex((t) => t.id === id);

					set((state) => {
						state.isDeleting[id] = true;
						state.error = null;
						// Optimistically remove
						state.tasks = state.tasks.filter((t) => t.id !== id);
						state.totalCount -= 1;
					});

					try {
						await taskService.deleteTask(id);

						set((state) => {
							delete state.isDeleting[id];
						});
					} catch (error) {
						set((state) => {
							// Restore on error
							if (originalTask && originalIndex !== -1) {
								state.tasks.splice(originalIndex, 0, originalTask);
								state.totalCount += 1;
							}
							state.error =
								error instanceof Error
									? error.message
									: "Failed to delete task";
							delete state.isDeleting[id];
						});
					}
				},

				// Bulk delete completed tasks
				deleteCompletedTasks: async (listId) => {
					const completedTasks = get().tasks.filter(
						(t) => t.completed && (!listId || t.listId === listId),
					);

					if (completedTasks.length === 0) return;

					const originalTasks = [...get().tasks];

					set((state) => {
						state.error = null;
						// Optimistically remove all completed tasks
						state.tasks = state.tasks.filter(
							(t) => !t.completed || (listId && t.listId !== listId),
						);
						state.totalCount -= completedTasks.length;
					});

					try {
						await Promise.all(
							completedTasks.map((task) => taskService.deleteTask(task.id)),
						);
					} catch (error) {
						set((state) => {
							// Restore on error
							state.tasks = originalTasks;
							state.totalCount = originalTasks.length;
							state.error =
								error instanceof Error
									? error.message
									: "Failed to delete completed tasks";
						});
					}
				},

				// Mark all tasks as complete
				markAllAsComplete: async (listId) => {
					const pendingTasks = get().tasks.filter(
						(t) => !t.completed && (!listId || t.listId === listId),
					);

					if (pendingTasks.length === 0) return;

					const originalTasks = [...get().tasks];

					set((state) => {
						state.error = null;
						// Optimistically mark all as complete
						state.tasks.forEach((task) => {
							if (!task.completed && (!listId || task.listId === listId)) {
								task.completed = true;
								task.updatedAt = new Date();
							}
						});
					});

					try {
						await Promise.all(
							pendingTasks.map((task) =>
								taskService.updateTask(task.id, { completed: true }),
							),
						);
					} catch (error) {
						set((state) => {
							// Restore on error
							state.tasks = originalTasks;
							state.error =
								error instanceof Error
									? error.message
									: "Failed to mark tasks as complete";
						});
					}
				},

				// UI Actions
				setSearchQuery: (query) =>
					set((state) => {
						state.searchQuery = query;
					}),

				setFilters: (filters) =>
					set((state) => {
						state.filters = { ...state.filters, ...filters };
					}),

				clearFilters: () =>
					set((state) => {
						state.filters = {
							listId: undefined,
							completed: undefined,
							sortBy: "createdAt",
							sortOrder: "desc",
						};
						state.searchQuery = "";
					}),

				clearError: () =>
					set((state) => {
						state.error = null;
					}),

				// Utilities
				getTaskById: (id) => get().tasks.find((t) => t.id === id),

				getTasksByListId: (listId) =>
					get().tasks.filter((t) => t.listId === listId),

				getFilteredTasks: () => {
					const { tasks, searchQuery, filters } = get();
					let filtered = [...tasks];

					// Apply search
					if (searchQuery) {
						const query = searchQuery.toLowerCase();
						filtered = filtered.filter(
							(task) =>
								task.title.toLowerCase().includes(query) ||
								task.description?.toLowerCase().includes(query),
						);
					}

					// Apply filters
					if (filters.listId) {
						filtered = filtered.filter(
							(task) => task.listId === filters.listId,
						);
					}

					if (filters.completed !== undefined) {
						filtered = filtered.filter(
							(task) => task.completed === filters.completed,
						);
					}

					// Apply sorting
					filtered.sort((a, b) => {
						const aValue = a[filters.sortBy || "createdAt"];
						const bValue = b[filters.sortBy || "createdAt"];

						if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
						if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
						return 0;
					});

					return filtered;
				},

				getTaskStats: () => {
					const tasks = get().tasks;
					const completed = tasks.filter((t) => t.completed).length;
					return {
						total: tasks.length,
						completed,
						pending: tasks.length - completed,
					};
				},
			})),
		),
		{
			name: "task-store",
		},
	),
);
