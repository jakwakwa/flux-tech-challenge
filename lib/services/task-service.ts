import type { CreateTaskRequest, Task, UpdateTaskRequest } from "@/lib/types";
import { ApiError } from "@/lib/utils/errors/api-error";

interface TaskResponse {
	data: Task[];
	page: number;
	totalPages: number;
	total: number;
}

interface TaskSearchParams {
	search?: string;
	page?: number;
	limit?: number;
	listId?: string;
	completed?: boolean;
	sortBy?: "createdAt" | "updatedAt" | "title" | "completed";
	sortOrder?: "asc" | "desc";
}

class TaskService {
	private baseUrl = "/api/tasks";

	/**
	 * Get all tasks with pagination and filters
	 */
	async getTasks(params: TaskSearchParams = {}): Promise<TaskResponse> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.append("page", params.page.toString());
		if (params.limit) searchParams.append("limit", params.limit.toString());
		if (params.search) searchParams.append("search", params.search);
		if (params.listId) searchParams.append("listId", params.listId);
		if (params.completed !== undefined)
			searchParams.append("completed", params.completed.toString());
		if (params.sortBy) searchParams.append("sortBy", params.sortBy);
		if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

		try {
			const response = await fetch(`${this.baseUrl}?${searchParams}`);

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return {
				data: result.data || [],
				page: result.meta?.page || 1,
				totalPages: result.meta?.totalPages || 1,
				total: result.meta?.total || 0,
			};
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to fetch tasks", "FETCH_ERROR", error);
		}
	}

	/**
	 * Get a single task by ID
	 */
	async getTask(id: string): Promise<Task> {
		try {
			const response = await fetch(`${this.baseUrl}/${id}`);

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to fetch task", "FETCH_ERROR", error);
		}
	}

	/**
	 * Create a new task
	 */
	async createTask(data: CreateTaskRequest): Promise<Task> {
		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to create task", "CREATE_ERROR", error);
		}
	}

	/**
	 * Update a task
	 */
	async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
		try {
			const response = await fetch(`${this.baseUrl}?taskId=${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to update task", "UPDATE_ERROR", error);
		}
	}

	/**
	 * Delete a task
	 */
	async deleteTask(id: string): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}?taskId=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw await ApiError.fromResponse(response);
			}
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError("Failed to delete task", "DELETE_ERROR", error);
		}
	}

	/**
	 * Bulk update tasks
	 */
	async bulkUpdateTasks(ids: string[], data: UpdateTaskRequest): Promise<void> {
		try {
			await Promise.all(ids.map((id) => this.updateTask(id, data)));
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError(
				"Failed to bulk update tasks",
				"BULK_UPDATE_ERROR",
				error,
			);
		}
	}

	/**
	 * Bulk delete tasks
	 */
	async bulkDeleteTasks(ids: string[]): Promise<void> {
		try {
			await Promise.all(ids.map((id) => this.deleteTask(id)));
		} catch (error) {
			if (error instanceof ApiError) throw error;
			throw new ApiError(
				"Failed to bulk delete tasks",
				"BULK_DELETE_ERROR",
				error,
			);
		}
	}
}

export const taskService = new TaskService();
