"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useListStore } from "@/lib/store/use-list-store";
import {
	CreateDialog,
	EditTaskDialog,
} from "../../../components/create-dialog";
import { type Task, TaskTable } from "./task-table";

interface TaskTableClientProps {
	initialTasks: Task[];
	hasLists: boolean;
}

export function TaskTableClient({
	initialTasks,
	hasLists,
}: TaskTableClientProps) {
	const router = useRouter();
	const [tasks, setTasks] = useState(initialTasks);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const { decrementTaskCount, updateTaskCompletion } = useListStore();

	// Update tasks when initialTasks prop changes (e.g., when search params change)
	useEffect(() => {
		setTasks(initialTasks);
	}, [initialTasks]);

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		try {
			const originalTask = tasks.find((t) => t.id === taskId);

			const response = await fetch("/api/tasks", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					taskId,
					...updates,
				}),
			});

			if (response.ok) {
				const updatedTask = await response.json();

				// Update local state
				setTasks((prevTasks) =>
					prevTasks.map((task) =>
						task.id === taskId ? { ...task, ...updates } : task,
					),
				);

				// Update list store if completion status changed
				if (
					originalTask &&
					updates.completed !== undefined &&
					updates.completed !== originalTask.completed
				) {
					updateTaskCompletion(
						originalTask.listId,
						originalTask.completed,
						updates.completed,
					);
				}

				// Refresh the page to get updated data
				router.refresh();
			} else {
				console.error("Failed to update task");
			}
		} catch (error) {
			console.error("Error updating task:", error);
		}
	};

	const handleTaskDelete = async (taskId: string) => {
		try {
			const taskToDelete = tasks.find((t) => t.id === taskId);

			const response = await fetch(`/api/tasks?taskId=${taskId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				// Update local state
				setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

				// Update list store
				if (taskToDelete) {
					decrementTaskCount(taskToDelete.listId, taskToDelete.completed);
				}

				// Refresh the page to get updated data
				router.refresh();
			} else {
				console.error("Failed to delete task");
			}
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	};

	const handleTaskEdit = (task: Task) => {
		setEditingTask(task);
		setEditDialogOpen(true);
	};

	const handleEditDialogClose = () => {
		setEditDialogOpen(false);
		setEditingTask(null);
	};

	const createTaskTrigger = (
		<Button size="sm" className="bg-primary hover:bg-primary/90">
			<Plus className="h-4 w-4 mr-2" />
			Add Task
		</Button>
	);

	const createFirstTaskTrigger = (
		<Button variant="outline" size="sm">
			<Plus className="h-4 w-4 mr-2" />
			Create your first task
		</Button>
	);

	return (
		<>
			<TaskTable
				tasks={tasks}
				onTaskUpdate={handleTaskUpdate}
				onTaskDelete={handleTaskDelete}
				onTaskEdit={handleTaskEdit}
				createDialog={
					hasLists ? (
						<CreateDialog defaultMode="task" trigger={createTaskTrigger} />
					) : null
				}
			/>
			{editingTask && (
				<EditTaskDialog
					task={editingTask}
					onTaskUpdate={handleTaskUpdate}
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
				/>
			)}
		</>
	);
}
