import { auth } from "@clerk/nextjs/server";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
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
			title: "Todo Lists",
			url: "/dashboard",
			icon: "Home" as const,
			isActive: true,
		},
	];

	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader>
				<div className="p-2">
					<h2 className="text-lg font-semibold px-2">Todo List App</h2>
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
