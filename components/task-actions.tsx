"use client";

import { CheckCircle2, Circle, Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditTaskDialog } from "@/components/create-dialog";
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
import { Button } from "@/components/ui/button";
import { useListStore } from "@/lib/store/use-list-store";

interface TaskActionsProps {
	task: {
		id: string;
		title: string;
		description: string | null;
		completed: boolean;
		listId: string;
		createdAt: Date;
		updatedAt: Date;
		list: {
			id: string;
			title: string;
		};
	};
}

export function TaskActions({ task }: TaskActionsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isToggling, setIsToggling] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const { updateTaskCompletion, decrementTaskCount } = useListStore();

	const handleToggleComplete = async () => {
		try {
			setIsToggling(true);
			const response = await fetch(`/api/tasks?taskId=${task.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					completed: !task.completed,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update task");
			}

			// Update task counts in list store
			updateTaskCompletion(task.listId, task.completed, !task.completed);

			// Refresh the page to show updated data
			router.refresh();
		} catch (error) {
			console.error("Error updating task:", error);
			alert("Failed to update task. Please try again.");
		} finally {
			setIsToggling(false);
		}
	};

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			const response = await fetch(`/api/tasks?taskId=${task.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete task");
			}

			// Update task counts in list store
			decrementTaskCount(task.listId, task.completed);

			// Redirect to the list page after deletion
			router.push(`/dashboard?listId=${task.list.id}`);
		} catch (error) {
			console.error("Error deleting task:", error);
			alert("Failed to delete task. Please try again.");
			setIsDeleting(false);
		}
	};

	const handleTaskUpdate = async (taskId: string, updates: any) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/tasks?taskId=${taskId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update task");
			}

			// Refresh the page to show updated data
			router.refresh();
			setEditDialogOpen(false);
		} catch (error) {
			console.error("Error updating task:", error);
			alert("Failed to update task. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex gap-3 flex-wrap">
			{/* Edit Button */}
			<Button
				variant="outline"
				onClick={() => setEditDialogOpen(true)}
				disabled={isLoading || isDeleting || isToggling}
			>
				<Edit className="h-4 w-4 mr-2" />
				Edit Task
			</Button>

			{/* Toggle Complete Button */}
			<Button
				variant={task.completed ? "secondary" : "default"}
				onClick={handleToggleComplete}
				disabled={isLoading || isDeleting || isToggling}
			>
				{isToggling ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Updating...
					</>
				) : (
					<>
						{task.completed ? (
							<Circle className="h-4 w-4 mr-2" />
						) : (
							<CheckCircle2 className="h-4 w-4 mr-2" />
						)}
						{task.completed ? "Mark as Pending" : "Mark as Complete"}
					</>
				)}
			</Button>

			{/* Delete Button */}
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="destructive"
						disabled={isLoading || isDeleting || isToggling}
					>
						{isDeleting ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Task
							</>
						)}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							task "{task.title}".
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit Dialog */}
			<EditTaskDialog
				task={{
					id: task.id,
					title: task.title,
					description: task.description || undefined,
					listId: task.listId,
					listName: task.list.title,
				}}
				onTaskUpdate={handleTaskUpdate}
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
			/>
		</div>
	);
}
