import { auth } from "@clerk/nextjs/server";
import { APP_LIMITS, LIMIT_ERRORS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { ApiResponseHandler } from "@/lib/utils/api-response";
import { createListSchema, updateListSchema, searchSchema } from "@/lib/validators";
import { List } from "@/lib/types";

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
		});

		if (!queryResult.success) {
			return ApiResponseHandler.validationError(queryResult.error);
		}

		const { page, limit, sortBy, sortOrder, query } = queryResult.data;
		const skip = (page - 1) * limit;

		// Build where clause
		const where = {
			userId,
			...(query && {
				title: {
					contains: query,
					mode: 'insensitive' as const,
				},
			}),
		};

		// Execute queries in parallel for better performance
		const [lists, total] = await Promise.all([
			prisma.list.findMany({
				where,
				include: {
					tasks: {
						orderBy: {
							createdAt: "desc",
						},
					},
				},
				orderBy: {
					[sortBy]: sortOrder,
				},
				skip,
				take: limit,
			}),
			prisma.list.count({ where }),
		]);

		return ApiResponseHandler.success(lists, {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error fetching lists:", error);
		return ApiResponseHandler.error("Failed to fetch lists");
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
		const validationResult = createListSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiResponseHandler.validationError(validationResult.error);
		}

		const { title } = validationResult.data;

		// Ensure user exists in database (create if not exists)
		await prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
				email: "", // This will be updated from Clerk data
			},
		});

		// Check if user has reached list limit
		const listCount = await prisma.list.count({
			where: { userId },
		});

		if (listCount >= APP_LIMITS.MAX_LISTS_PER_USER) {
			return ApiResponseHandler.badRequest(LIMIT_ERRORS.MAX_LISTS_EXCEEDED);
		}

		// Create the list
		const list = await prisma.list.create({
			data: {
				title,
				userId,
			},
			include: {
				tasks: true,
			},
		});

		return ApiResponseHandler.success(list);
	} catch (error) {
		console.error("Error creating list:", error);
		
		// Handle specific Prisma errors
		if (error instanceof Error && error.message.includes('P2002')) {
			return ApiResponseHandler.conflict("A list with this title already exists");
		}
		
		return ApiResponseHandler.error("Failed to create list");
	}
}

export async function PUT(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Get list ID from URL
		const { searchParams } = new URL(request.url);
		const listId = searchParams.get("listId");

		if (!listId) {
			return ApiResponseHandler.badRequest("List ID is required");
		}

		// Parse and validate request body
		const body = await request.json();
		const validationResult = updateListSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiResponseHandler.validationError(validationResult.error);
		}

		const { title } = validationResult.data;

		// Check if the list exists and belongs to the user
		const existingList = await prisma.list.findFirst({
			where: {
				id: listId,
				userId,
			},
		});

		if (!existingList) {
			return ApiResponseHandler.notFound("List");
		}

		// Update the list
		const updatedList = await prisma.list.update({
			where: { id: listId },
			data: { title },
			include: {
				tasks: true,
			},
		});

		return ApiResponseHandler.success(updatedList);
	} catch (error) {
		console.error("Error updating list:", error);
		return ApiResponseHandler.error("Failed to update list");
	}
}

export async function DELETE(request: Request) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiResponseHandler.unauthorized();
		}

		// Get list ID from URL
		const { searchParams } = new URL(request.url);
		const listId = searchParams.get("listId");

		if (!listId) {
			return ApiResponseHandler.badRequest("List ID is required");
		}

		// Check if the list exists and belongs to the user
		const existingList = await prisma.list.findFirst({
			where: {
				id: listId,
				userId,
			},
		});

		if (!existingList) {
			return ApiResponseHandler.notFound("List");
		}

		// Delete the list (tasks will be cascade deleted)
		await prisma.list.delete({
			where: { id: listId },
		});

		return ApiResponseHandler.success({ message: "List deleted successfully" });
	} catch (error) {
		console.error("Error deleting list:", error);
		return ApiResponseHandler.error("Failed to delete list");
	}
}
