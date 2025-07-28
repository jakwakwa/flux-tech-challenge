import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		// Fetch lists for the authenticated user
		const lists = await prisma.list.findMany({
			where: {
				userId: userId,
			},
			include: {
				tasks: {
					orderBy: {
						createdAt: "desc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(lists, { status: 200 });
	} catch (error) {
		console.error("Error fetching lists:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function POST(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const body = await request.json();
		const { title } = body;

		if (!title || title.trim().length === 0) {
			return new NextResponse("Title is required", { status: 400 });
		}

		// Create the list
		const list = await prisma.list.create({
			data: {
				title: title.trim(),
				userId: userId,
			},
			include: {
				tasks: true,
			},
		});

		return NextResponse.json(list, { status: 201 });
	} catch (error) {
		console.error("Error creating list:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function PATCH(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const body = await request.json();
		const { listId, title } = body;

		if (!listId) {
			return new NextResponse("List ID is required", { status: 400 });
		}

		if (!title || title.trim().length === 0) {
			return new NextResponse("Title is required", { status: 400 });
		}

		// Verify the list belongs to the authenticated user
		const existingList = await prisma.list.findFirst({
			where: {
				id: listId,
				userId: userId,
			},
		});

		if (!existingList) {
			return new NextResponse("List not found or unauthorized", {
				status: 404,
			});
		}

		// Update the list
		const updatedList = await prisma.list.update({
			where: {
				id: listId,
			},
			data: {
				title: title.trim(),
			},
			include: {
				tasks: {
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});

		return NextResponse.json(updatedList, { status: 200 });
	} catch (error) {
		console.error("Error updating list:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(request: Request) {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const listId = searchParams.get("listId");

		if (!listId) {
			return new NextResponse("List ID is required", { status: 400 });
		}

		// Verify the list belongs to the authenticated user
		const existingList = await prisma.list.findFirst({
			where: {
				id: listId,
				userId: userId,
			},
		});

		if (!existingList) {
			return new NextResponse("List not found or unauthorized", {
				status: 404,
			});
		}

		// Delete the list (tasks will be cascade deleted due to schema)
		await prisma.list.delete({
			where: {
				id: listId,
			},
		});

		return new NextResponse("List deleted successfully", { status: 200 });
	} catch (error) {
		console.error("Error deleting list:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
