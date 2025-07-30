import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Calendar, Clock, List } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import { TaskActions } from "@/components/task-actions";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

interface TaskPageProps {
	params: Promise<{
		taskId: string;
	}>;
}

export default async function TaskPage({ params }: TaskPageProps) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const { taskId } = await params;

	// Fetch the task with list information
	const task = await prisma.task.findFirst({
		where: {
			id: taskId,
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
	});

	if (!task) {
		notFound();
	}

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
									<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink href={`/dashboard?listId=${task.list.id}`}>
										{task.list.title}
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage className="line-clamp-1">
										{task.title}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="ml-auto flex items-center gap-3 px-3">
						<NavActions
							selectedList={{ id: task.list.id, title: task.list.title }}
						/>
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-6">
					{/* Back Button */}
					<div className="flex items-center gap-4">
						<Button variant="outline" size="sm" asChild>
							<Link href={`/dashboard?listId=${task.list.id}`}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to List
							</Link>
						</Button>
					</div>

					{/* Task Details */}
					<div className="space-y-6">
						{/* Task Header */}
						<div className="space-y-4">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<h1 className="text-3xl font-bold">{task.title}</h1>
									<div className="flex items-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-2">
											<List className="h-4 w-4" />
											<span>{task.list.title}</span>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<span>Created {task.createdAt.toLocaleDateString()}</span>
										</div>
										{task.updatedAt.getTime() !== task.createdAt.getTime() && (
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												<span>
													Updated {task.updatedAt.toLocaleDateString()}
												</span>
											</div>
										)}
									</div>
								</div>
								<Badge
									variant={task.completed ? "default" : "secondary"}
									className={
										task.completed
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}
								>
									{task.completed ? "Completed" : "Pending"}
								</Badge>
							</div>
						</div>

						{/* Task Description */}
						<Card>
							<CardHeader>
								<CardTitle>Description</CardTitle>
							</CardHeader>
							<CardContent>
								{task.description ? (
									<p className="text-muted-foreground whitespace-pre-wrap">
										{task.description}
									</p>
								) : (
									<p className="text-muted-foreground italic">
										No description provided
									</p>
								)}
							</CardContent>
						</Card>

						{/* Task Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<TaskActions task={task} />
							</CardContent>
						</Card>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
