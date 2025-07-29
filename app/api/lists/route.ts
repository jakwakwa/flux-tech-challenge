import { NextResponse } from "next/server";
import { ApiResponseHandler } from "@/lib/api-response";
import { DatabaseService } from "@/lib/services/database";
import { validateRequired, validateStringLength } from "@/lib/errors";

export async function GET() {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		const lists = await DatabaseService.getUserLists(userId);
		
		return ApiResponseHandler.success(lists);
	} catch (error) {
		console.error("Error fetching lists:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function POST(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		await DatabaseService.ensureUserExists(userId);

		const body = await request.json();
		const { title } = body;

		// Validate input
		validateRequired(title, "title");
		validateStringLength(title, "title", 1, 100);

		const list = await DatabaseService.createList(userId, title);
		
		return ApiResponseHandler.success(list, 201);
	} catch (error) {
		console.error("Error creating list:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function PATCH(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		
		const body = await request.json();
		const { listId, title } = body;

		// Validate input
		validateRequired(listId, "listId");
		validateRequired(title, "title");
		validateStringLength(title, "title", 1, 100);

		const updatedList = await DatabaseService.updateList(listId, userId, title);
		
		return ApiResponseHandler.success(updatedList);
	} catch (error) {
		console.error("Error updating list:", error);
		return ApiResponseHandler.error(error as Error);
	}
}

export async function DELETE(request: Request) {
	try {
		const userId = await DatabaseService.getAuthenticatedUserId();
		
		const { searchParams } = new URL(request.url);
		const listId = searchParams.get("listId");

		if (!listId) {
			return ApiResponseHandler.validationError("List ID is required", "listId");
		}

		await DatabaseService.deleteList(listId, userId);
		
		return ApiResponseHandler.success({ message: "List deleted successfully" });
	} catch (error) {
		console.error("Error deleting list:", error);
		return ApiResponseHandler.error(error as Error);
	}
}
