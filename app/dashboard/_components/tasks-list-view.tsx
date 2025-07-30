"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { TaskTable } from "@/app/tasks/_components/task-table";
import { Button } from "@/components/ui/button";
import { TaskListSkeleton } from "@/components/ui/loading-skeleton";
import { useTaskStore } from "@/lib/store/use-task-store";
import { useUIStore } from "@/lib/store/use-ui-store";

interface TaskViewProps {
	listId: string;
	listTitle: string;
}

export function TasksListView({ listId, listTitle }: TaskViewProps) {
	const { tasks, isLoading, isCreating, deleteTask, updateTask } =
		useTaskStore();

	const { openModal, addToast } = useUIStore();

	// Filter tasks for this list
	const listTasks = useMemo(() => {
		return tasks.filter((task) => task.listId === listId);
	}, [tasks, listId]);

	const handleTaskUpdate = async (taskId: string, updates: any) => {
		try {
			await updateTask(taskId, updates);
			addToast({
				type: "success",
				title: "Task updated",
				description: "Your changes have been saved.",
			});
		} catch (error) {
			addToast({
				type: "error",
				title: "Failed to update task",
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		}
	};

	const handleTaskDelete = async (taskId: string) => {
		try {
			await deleteTask(taskId);
			addToast({
				type: "success",
				title: "Task deleted",
				description: "The task has been removed.",
			});
		} catch (error) {
			addToast({
				type: "error",
				title: "Failed to delete task",
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		}
	};

	const handleTaskEdit = (task: any) => {
		openModal("editTask", { taskId: task.id });
	};

	const createTaskButton = (
		<Button
			size="sm"
			onClick={() => openModal("createTask")}
			disabled={isCreating}
		>
			<Plus className="h-4 w-4 mr-2" />
			Add Task
		</Button>
	);

	// Transform tasks for TaskTable compatibility
	const tasksForTable = listTasks.map((task) => ({
		id: task.id,
		title: task.title,
		description: task.description || undefined,
		completed: task.completed,
		listId: task.listId,
		listName: listTitle,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
	}));

	if (isLoading) {
		return <TaskListSkeleton />;
	}

	return (
		<div className="space-y-4">
			<TaskTable
				tasks={tasksForTable}
				onTaskUpdate={handleTaskUpdate}
				onTaskDelete={handleTaskDelete}
				onTaskEdit={handleTaskEdit}
				createDialog={createTaskButton}
				title={`${listTitle} - Tasks`}
			/>
		</div>
	);
}
