import { NextResponse } from "next/server";
import { ApiResponseHandler } from "@/lib/api-response";
import { DatabaseService } from "@/lib/services/database";
import { validateRequired, validateStringLength } from "@/lib/errors";

export async function GET() {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		const tasks = await DatabaseService.getUserTasks(userId);
		
		return ApiResponseHandler.success(tasks);
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function POST(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		await DatabaseService.ensureUserExists(userId);

		const body = await request.json();
		const { title, description, listId } = body;

		// Validate input
		validateRequired(title, "title");
		validateRequired(listId, "listId");
		validateStringLength(title, "title", 1, 200);

		const task = await DatabaseService.createTask(userId, {
			title,
			description,
			listId,
		});
		
		return ApiResponseHandler.success(task, 201);
	} catch (error) {
		console.error("Error creating task:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function PATCH(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		
		const body = await request.json();
		const { taskId, title, description, completed } = body;

		// Validate input
		validateRequired(taskId, "taskId");

		const updates: Partial<{ title: string; description: string; completed: boolean }> = {};
		if (title !== undefined) {
			validateStringLength(title, "title", 1, 200);
			updates.title = title;
		}
		if (description !== undefined) {
			updates.description = description;
		}
		if (completed !== undefined) {
			updates.completed = completed;
		}

		const updatedTask = await DatabaseService.updateTask(taskId, userId, updates);
		
		return ApiResponseHandler.success(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function DELETE(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get("taskId");

		if (!taskId) {
			return ApiResponseHandler.validationError("Task ID is required", "taskId");
		}

		await DatabaseService.deleteTask(taskId, userId);
		
		return ApiResponseHandler.success({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		return ApiResponseHandler.error(error as Error);
	}
}
