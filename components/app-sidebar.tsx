import { auth } from "@clerk/nextjs/server";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavTodoLists } from "@/components/nav-todo-lists";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

// Get consistent emoji for lists based on ID
const getEmojiForList = (listId: string) => {
	const emojis = [
		"📝",
		"💼",
		"🎯",
		"🛒",
		"🏠",
		"📚",
		"🎵",
		"🎨",
		"🍳",
		"🏃",
		"💡",
		"🎮",
	];
	// Use simple hash function to get consistent emoji based on list ID
	let hash = 0;
	for (let i = 0; i < listId.length; i++) {
		const char = listId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return emojis[Math.abs(hash) % emojis.length];
};

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
				orderBy: {
					createdAt: "desc",
				},
				take: 10, // Limit to 10 most recent tasks per list for sidebar
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

	// Transform data for components
	const todoLists = userLists.map((list: any) => ({
		id: list.id,
		name: list.title, // Map list.title to name
		url: `/lists/${list.id}`, // Re-added the url property
		icon: getEmojiForList(list.id),
		taskCount: list.tasks.length,
		completedCount: list.tasks.filter((task: any) => task.completed).length,
		tasks: list.tasks.map((task: any) => ({
			// Ensure tasks are also using Prisma Task type
			id: task.id,
			title: task.title,
			completed: task.completed,
		})),
	}));

	const navMain = [
		{
			title: "All Tasks",
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
				<NavTodoLists todoLists={todoLists} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
