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
import { StoreInitializer } from "@/components/store-initializer";
import { ListPageClient } from "@/components/list-page-client";
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

	// Fetch all user lists for the store initialization
	const userLists = await prisma.list.findMany({
		where: {
			userId: userId,
		},
		include: {
			tasks: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	// Tasks will be displayed reactively from the client component

	return (
		<SidebarProvider>
			<StoreInitializer lists={userLists} tasks={list.tasks} />
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

					{/* Client component that reactively displays tasks from store */}
					<ListPageClient listId={list.id} listTitle={list.title} />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}