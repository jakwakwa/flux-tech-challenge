import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import { TaskTable } from "@/components/task-table";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateDialog } from "@/components/create-dialog";
import prisma from "@/lib/prisma";

interface ListPageProps {
	params: Promise<{
		listId: string;
	}>;
}

export default async function ListPage({ params }: ListPageProps) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const user = await currentUser();

	// Ensure user exists in database (create if not exists)
	await prisma.user.upsert({
		where: { id: userId },
		update: {
			email: user?.emailAddresses?.[0]?.emailAddress || "",
			name: user?.firstName
				? `${user.firstName} ${user.lastName || ""}`.trim()
				: null,
		},
		create: {
			id: userId,
			email: user?.emailAddresses?.[0]?.emailAddress || "",
			name: user?.firstName
				? `${user.firstName} ${user.lastName || ""}`.trim()
				: null,
		},
	});

	const { listId } = await params;

	// Fetch the list and verify ownership
	const list = await prisma.list.findFirst({
		where: {
			id: listId,
			userId: userId,
		},
		include: {
			tasks: {
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});

	if (!list) {
		notFound();
	}

	// Transform tasks for TaskTable
	const tasksForTable = list.tasks.map((task) => ({
		id: task.id,
		title: task.title,
		description: task.description || undefined,
		completed: task.completed,
		listId: task.listId,
		listName: list.title,
		createdAt: task.createdAt,
		updatedAt: task.updatedAt,
	}));

	// Calculate task stats for this list
	const totalTasks = list.tasks.length;
	const completedTasks = list.tasks.filter((task) => task.completed).length;
	const pendingTasks = totalTasks - completedTasks;

	// Create task button for the TaskTable
	const createTaskButton = (
		<CreateDialog
			defaultMode="task"
			trigger={
				<Button size="sm">
					<Plus className="h-4 w-4 mr-2" />
					Add Task
				</Button>
			}
		/>
	);

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2">
					<div className="flex flex-1 items-center gap-2 px-3">
						<SidebarTrigger />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard">
										Dashboard
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage className="line-clamp-1">
										{list.title}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="ml-auto flex items-center gap-3 px-3">
						<NavActions selectedList={list} />
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-6">
					{/* Welcome Section */}
					<div className="space-y-2">
						<h1 className="text-2xl font-normal">
							List: <span className="font-bold">{list.title}</span>
						</h1>
						<p className="text-muted-foreground">
							Manage tasks in this list.
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Tasks
								</CardTitle>
								<Badge variant="secondary">{totalTasks}</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalTasks}</div>
								<p className="text-xs text-muted-foreground">
									Tasks in this list
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Pending Tasks
								</CardTitle>
								<Badge variant="secondary">{pendingTasks}</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{pendingTasks}</div>
								<p className="text-xs text-muted-foreground">Tasks to complete</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Completed</CardTitle>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									{totalTasks > 0
										? Math.round((completedTasks / totalTasks) * 100)
										: 0}
									%
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{completedTasks}</div>
								<p className="text-xs text-muted-foreground">Tasks completed</p>
							</CardContent>
						</Card>
					</div>

					{/* Task Table */}
					<div className="space-y-4">
						<TaskTable
							tasks={tasksForTable}
							title={`${list.title} - Tasks`}
							createDialog={createTaskButton}
						/>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}