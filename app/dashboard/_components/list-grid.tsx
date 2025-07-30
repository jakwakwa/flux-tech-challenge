"use client";

import { ArrowRight, Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListGridSkeleton } from "@/components/ui/loading-skeleton";
import { useListStore } from "@/lib/store/use-list-store";
import { useTaskStore } from "@/lib/store/use-task-store";
import { useUIStore } from "@/lib/store/use-ui-store";

export function ListGrid() {
	const router = useRouter();
	const { lists, isLoading, deleteList, isDeleting } = useListStore();
	const { getTasksByListId } = useTaskStore();
	const { openModal, addToast } = useUIStore();

	const handleDeleteList = async (id: string, title: string) => {
		if (
			!confirm(
				`Are you sure you want to delete "${title}"? This will also delete all tasks in this list.`,
			)
		) {
			return;
		}

		try {
			await deleteList(id);
			addToast({
				type: "success",
				title: "List deleted",
				description: `"${title}" has been deleted successfully.`,
			});
		} catch (error) {
			addToast({
				type: "error",
				title: "Failed to delete list",
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		}
	};

	if (isLoading) {
		return <ListGridSkeleton />;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">My Lists</h2>
				<Button onClick={() => openModal("createList")} size="sm">
					<Plus className="h-4 w-4 mr-2" />
					Create List
				</Button>
			</div>

			{lists.length === 0 ? (
				<Card className="p-12 text-center">
					<div className="mx-auto w-fit">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Plus className="h-6 w-6 text-muted-foreground" />
						</div>
						<h3 className="mt-4 text-lg font-semibold">No lists yet</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Create your first list to start organizing your tasks.
						</p>
						<Button
							onClick={() => openModal("createList")}
							className="mt-4"
							size="sm"
						>
							<Plus className="h-4 w-4 mr-2" />
							Create your first list
						</Button>
					</div>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{lists.map((list) => {
						const tasks = getTasksByListId(list.id);
						const completedTasks = tasks.filter((t) => t.completed).length;

						return (
							<Card
								key={list.id}
								className="relative group hover:shadow-md transition-shadow"
							>
								<CardHeader className="flex flex-row items-start justify-between space-y-0">
									<div className="flex-1">
										<CardTitle className="line-clamp-1">{list.title}</CardTitle>
										<p className="text-sm text-muted-foreground mt-1">
											{tasks.length} {tasks.length === 1 ? "task" : "tasks"}
										</p>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
												disabled={isDeleting[list.id]}
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() =>
													router.push(`/dashboard?listId=${list.id}`)
												}
											>
												<ArrowRight className="h-4 w-4 mr-2" />
												View Tasks
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													openModal("editList", { listId: list.id })
												}
											>
												<Edit2 className="h-4 w-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => handleDeleteList(list.id, list.title)}
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</CardHeader>
								<CardContent>
									{tasks.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Progress</span>
												<Badge variant="secondary" className="text-xs">
													{completedTasks}/{tasks.length}
												</Badge>
											</div>
											<div className="w-full bg-secondary rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-all"
													style={{
														width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%`,
													}}
												/>
											</div>
										</div>
									)}
									<div className="flex justify-end gap-2 mt-4">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												router.push(`/dashboard?listId=${list.id}`)
											}
										>
											View
										</Button>
										<Button
											size="sm"
											onClick={() => {
												router.push(`/dashboard?listId=${list.id}`);
												// Small delay to ensure navigation happens first
												setTimeout(() => openModal("createTask"), 100);
											}}
										>
											<Plus className="h-4 w-4 mr-1" />
											Add Task
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
