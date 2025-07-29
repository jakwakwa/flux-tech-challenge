import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ApiResponseHandler } from "@/lib/utils/api-response";
import { createTaskSchema, updateTaskSchema, searchSchema, idSchema } from "@/lib/validators";
import { Task } from "@/lib/types";

export async function GET(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Parse and validate query parameters
		const { searchParams } = new URL(request.url);
		const queryResult = searchSchema.safeParse({
			page: searchParams.get('page'),
			limit: searchParams.get('limit'),
			sortBy: searchParams.get('sortBy'),
			sortOrder: searchParams.get('sortOrder'),
			query: searchParams.get('query'),
			listId: searchParams.get('listId'),
			completed: searchParams.get('completed'),
		});

		if (!queryResult.success) {
			return ApiResponseHandler.validationError(queryResult.error);
		}

		const { page, limit, sortBy, sortOrder, query, listId, completed } = queryResult.data;
		const skip = (page - 1) * limit;

		// Build where clause
		const where = {
			list: {
				userId,
				...(listId && { id: listId }),
			},
			...(query && {
				OR: [
					{
						title: {
							contains: query,
							mode: 'insensitive' as const,
						},
					},
					{
						description: {
							contains: query,
							mode: 'insensitive' as const,
						},
					},
				],
			}),
			...(completed !== undefined && { completed }),
		};

		// Execute queries in parallel for better performance
		const [tasks, total] = await Promise.all([
			prisma.task.findMany({
				where,
				include: {
					list: {
						select: {
							id: true,
							title: true,
						},
					},
				},
				orderBy: {
					[sortBy]: sortOrder,
				},
				skip,
				take: limit,
			}),
			prisma.task.count({ where }),
		]);

		return ApiResponseHandler.success<Task[]>(tasks, {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return ApiResponseHandler.error("Failed to fetch tasks");
	}
}

export async function POST(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Parse and validate request body
		const body = await request.json();
		const validationResult = createTaskSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiResponseHandler.validationError(validationResult.error);
		}

		const { title, description, listId } = validationResult.data;

		// Ensure user exists in database (create if not exists)
		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
				email: "", // This will be updated from Clerk data
			},
		});

		// Verify the list exists and belongs to the user
		const list = await prisma.list.findFirst({
			where: {
				id: listId,
				userId,
			},
		});

		if (!list) {
			return ApiResponseHandler.notFound("List");
		}

		// Create the task
		const task = await prisma.task.create({
			data: {
				title,
				description,
				listId,
			},
			include: {
				list: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		return ApiResponseHandler.success<Task>(task);
	} catch (error) {
		console.error("Error creating task:", error);
		return ApiResponseHandler.error("Failed to create task");
	}
}

export async function PUT(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Get task ID from URL
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get("taskId");

		if (!taskId) {
			return ApiResponseHandler.badRequest("Task ID is required");
		}

		// Validate task ID format
		const idValidation = idSchema.safeParse(taskId);
		if (!idValidation.success) {
			return ApiResponseHandler.badRequest("Invalid task ID format");
		}

		// Parse and validate request body
		const body = await request.json();
		const validationResult = updateTaskSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiResponseHandler.validationError(validationResult.error);
		}

		const updateData = validationResult.data;

		// Check if the task exists and user has access
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				list: {
					userId,
				},
			},
			include: {
				list: true,
			},
		});

		if (!existingTask) {
			return ApiResponseHandler.notFound("Task");
		}

		// If changing list, verify the new list exists and belongs to the user
		if (updateData.listId && updateData.listId !== existingTask.listId) {
			const newList = await prisma.list.findFirst({
				where: {
					id: updateData.listId,
					userId,
				},
			});

			if (!newList) {
				return ApiResponseHandler.notFound("Target list");
			}
		}

		// Update the task
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: updateData,
			include: {
				list: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		return ApiResponseHandler.success<Task>(updatedTask);
	} catch (error) {
		console.error("Error updating task:", error);
		return ApiResponseHandler.error("Failed to update task");
	}
}

export async function DELETE(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Get task ID from URL
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get("taskId");

		if (!taskId) {
			return ApiResponseHandler.badRequest("Task ID is required");
		}

		// Validate task ID format
		const idValidation = idSchema.safeParse(taskId);
		if (!idValidation.success) {
			return ApiResponseHandler.badRequest("Invalid task ID format");
		}

		// Check if the task exists and user has access
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				list: {
					userId,
				},
			},
		});

		if (!existingTask) {
			return ApiResponseHandler.notFound("Task");
		}

		// Delete the task
		await prisma.task.delete({
			where: { id: taskId },
		});

		return ApiResponseHandler.success({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", error);
		return ApiResponseHandler.error("Failed to delete task");
	}
}
