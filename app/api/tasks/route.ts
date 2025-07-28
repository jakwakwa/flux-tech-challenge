import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		// Fetch tasks for the authenticated user
		const tasks = await prisma.task.findMany({
			where: {
				list: {
					userId: userId,
				},
			},
			include: {
				list: {
					select: {
						id: true,
						title: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(tasks, { status: 200 });
	} catch (error) {
		console.error("Error fetching tasks:", error);
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
		const { title, description, listId } = body;

		if (!title || !listId) {
			return new NextResponse("Title and listId are required", { status: 400 });
		}

		// Verify the list belongs to the authenticated user
		const list = await prisma.list.findFirst({
			where: {
				id: listId,
				userId: userId,
			},
		});

		if (!list) {
			return new NextResponse("List not found or unauthorized", {
				status: 404,
			});
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

		return NextResponse.json(task, { status: 201 });
	} catch (error) {
		console.error("Error creating task:", error);
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
		const { taskId, title, description, completed } = body;

		if (!taskId) {
			return new NextResponse("Task ID is required", { status: 400 });
		}

		// Verify the task belongs to the authenticated user
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				list: {
					userId: userId,
				},
			},
		});

		if (!existingTask) {
			return new NextResponse("Task not found or unauthorized", {
				status: 404,
			});
		}

		// Update the task
		const updatedTask = await prisma.task.update({
			where: {
				id: taskId,
			},
			data: {
				...(title !== undefined && { title }),
				...(description !== undefined && { description }),
				...(completed !== undefined && { completed }),
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

		return NextResponse.json(updatedTask, { status: 200 });
	} catch (error) {
		console.error("Error updating task:", error);
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
		const taskId = searchParams.get("taskId");

		if (!taskId) {
			return new NextResponse("Task ID is required", { status: 400 });
		}

		// Verify the task belongs to the authenticated user
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				list: {
					userId: userId,
				},
			},
		});

		if (!existingTask) {
			return new NextResponse("Task not found or unauthorized", {
				status: 404,
			});
		}

		// Delete the task
		await prisma.task.delete({
			where: {
				id: taskId,
			},
		});

		return new NextResponse("Task deleted successfully", { status: 200 });
	} catch (error) {
		console.error("Error deleting task:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
