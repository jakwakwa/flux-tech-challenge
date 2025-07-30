"use client";

import { Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateDialog, EditListDialog } from "@/components/create-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useListStore } from "@/lib/store/use-list-store";
import { useUIStore } from "@/lib/store/use-ui-store";

// Get consistent emoji for lists based on ID
const getEmojiForList = (listId: string) => {
	const emojis = [
		"📝",
		"💼",
		"🎯",
		"🛒",
		"🏠",
		"📚",
		"🎵",
		"🎨",
		"🍳",
		"🏃",
		"💡",
		"🎮",
	];

	let hash = 0;
	for (let i = 0; i < listId.length; i++) {
		const char = listId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return emojis[Math.abs(hash) % emojis.length];
};

interface NavTodoListsClientProps {
	initialLists: Array<{
		id: string;
		title: string;
		tasks: Array<{
			id: string;
			completed: boolean;
		}>;
	}>;
}

export function NavTodoListsClient({ initialLists }: NavTodoListsClientProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { addToast } = useUIStore();
	const [editingList, setEditingList] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState<
		string | null
	>(null);
	const [isStoreInitialized, setIsStoreInitialized] = useState(false);

	// Determine which operations are possible based on current route
	const isDashboard = pathname === "/dashboard";
	const isListPage = pathname.startsWith("/lists/");
	const currentListId = isListPage ? pathname.split("/")[2] : null;

	// Always use the store hooks (React rules require this)
	const {
		lists: storeLists,
		deleteList,
		isDeleting,
		initializeTaskCounts,
		getTaskCounts,
	} = useListStore();

	// Initialize task counts from server data on mount
	useEffect(() => {
		if (initialLists.length > 0) {
			initializeTaskCounts(initialLists);
		}
	}, [initialLists, initializeTaskCounts]);

	// Track if the store has ever been populated (once it has data, it becomes the source of truth)
	useEffect(() => {
		// Mark as initialized if we're on dashboard/list pages, OR if store has data
		// This ensures we switch to store mode immediately on these pages
		if (isDashboard || isListPage) {
			setIsStoreInitialized(true);
		}
		// Also initialize if store gets populated
		if (storeLists.length > 0) {
			setIsStoreInitialized(true);
		}
	}, [storeLists.length, isDashboard, isListPage]);

	// Use store data if initialized, otherwise use initial server data
	// Once initialized, ALWAYS use store data (even when empty) to prevent stale data
	const displayLists =
		(isDashboard || isListPage) && isStoreInitialized
			? storeLists
			: initialLists;

	// Define delete handler when on dashboard OR when on a list page
	const handleDeleteList =
		isDashboard || isListPage
			? async (id: string, title: string) => {
					try {
						await deleteList(id);
						addToast({
							type: "success",
							title: "List deleted",
							description: `"${title}" has been deleted successfully.`,
						});

						// If we're deleting the current list page, redirect to dashboard
						if (isListPage && id === currentListId) {
							router.push("/dashboard");
						} else {
							// For other cases, refresh data to keep client and server in sync
							router.refresh();
						}
					} catch (error) {
						addToast({
							type: "error",
							title: "Failed to delete list",
							description:
								error instanceof Error ? error.message : "Please try again.",
						});
					}
				}
			: null;

	return (
		<>
			<SidebarGroup>
				<SidebarGroupLabel>Your Lists</SidebarGroupLabel>
				<SidebarMenu>
					{displayLists.map((list) => {
						// Use task counts from store if available, fallback to initial data
						const storeCounts = getTaskCounts(list.id);
						const taskCount =
							storeCounts.total > 0
								? storeCounts.total
								: list.tasks?.length || 0;
						const completedCount =
							storeCounts.total > 0
								? storeCounts.completed
								: list.tasks?.filter((t) => t.completed).length || 0;
						const isCurrentList = pathname === `/lists/${list.id}`;

						return (
							<SidebarMenuItem key={list.id}>
								<SidebarMenuButton
									asChild
									tooltip={list.title}
									isActive={isCurrentList}
								>
									<Link href={`/lists/${list.id}`}>
										<span className="text-base mr-2">
											{getEmojiForList(list.id)}
										</span>
										<span className="flex-1 truncate">{list.title}</span>
										<span className="text-xs text-muted-foreground">
											{completedCount}/{taskCount}
										</span>
									</Link>
								</SidebarMenuButton>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction
											showOnHover
											disabled={isDeleting[list.id]}
										>
											{isDeleting[list.id] ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<MoreHorizontal />
											)}
											<span className="sr-only">More</span>
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-48 rounded-lg"
										side="bottom"
										align="end"
									>
										{/* Edit List - Only show when on the specific list page */}
										{isListPage && currentListId === list.id && (
											<DropdownMenuItem
												onClick={() =>
													setEditingList({ id: list.id, title: list.title })
												}
											>
												<span>Edit List</span>
											</DropdownMenuItem>
										)}

										{/* Add Task - Always available */}
										<DropdownMenuItem
											onClick={() => setCreateTaskDialogOpen(list.id)}
										>
											<span>Add Task</span>
										</DropdownMenuItem>

										{/* Delete List - Show when on dashboard OR when on the current list page */}
										{(isDashboard ||
											(isListPage && currentListId === list.id)) && (
											<>
												<DropdownMenuSeparator />
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}
															className="text-destructive"
														>
															<span>Delete List</span>
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Are you sure?</AlertDialogTitle>
															<AlertDialogDescription>
																This action cannot be undone. This will
																permanently delete the list "{list.title}" and
																all {taskCount} task{taskCount !== 1 ? "s" : ""}{" "}
																in this list.
																{isListPage && currentListId === list.id && (
																	<span className="block mt-2 font-medium">
																		You will be redirected to the dashboard
																		after deletion.
																	</span>
																)}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDeleteList?.(list.id, list.title)
																}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																Delete List
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroup>

			{/* Edit List Dialog - Only available on list pages */}
			{editingList && isListPage && (
				<EditListDialog
					list={editingList}
					open={!!editingList}
					onOpenChange={(open) => !open && setEditingList(null)}
				/>
			)}

			{/* Create Task Dialog */}
			{createTaskDialogOpen && (
				<CreateDialog
					defaultMode="task"
					currentListId={createTaskDialogOpen}
					open={!!createTaskDialogOpen}
					onOpenChange={(open) => !open && setCreateTaskDialogOpen(null)}
				/>
			)}
		</>
	);
}
