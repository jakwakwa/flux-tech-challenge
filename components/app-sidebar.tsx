import { auth } from "@clerk/nextjs/server";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavTodoListsClient } from "@/components/nav-todo-lists-client";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

export async function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { userId } = await auth();

	if (!userId) {
		return null;
	}

	// Fetch user's lists with task counts
	const userLists = await prisma.list.findMany({
		where: {
			userId: userId,
		},
		include: {
			tasks: {
				select: {
					id: true,
					completed: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	// Get total task count for "All Tasks" badge
	const totalTaskCount = await prisma.task.count({
		where: {
			list: {
				userId: userId,
			},
		},
	});

	// Transform data for the client component (simplified, only lists without individual task details)
	const todoLists = userLists.map((list) => ({
		id: list.id,
		title: list.title,
		tasks: list.tasks.map((task) => ({
			id: task.id,
			completed: task.completed,
		})),
	}));

	const navMain = [
		{
			title: "ListsDashboard",
			url: "/dashboard",
			icon: "Home" as const,
			isActive: true,
		},
	];

	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader>
				<div className="p-2">
					<h2 className="text-lg font-semibold px-2">Flux Todo List App</h2>
				</div>
				<NavMain items={navMain} />
			</SidebarHeader>
			<SidebarContent>
				<NavTodoListsClient initialLists={todoLists} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
