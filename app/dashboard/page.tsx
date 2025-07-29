import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CreateDialog } from "@/components/create-dialog";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
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

	// Fetch user's lists with task counts
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

	// Calculate overall stats
	const totalLists = userLists.length;
	const totalTasks = userLists.reduce((sum, list) => sum + list.tasks.length, 0);
	const completedTasks = userLists.reduce(
		(sum, list) => sum + list.tasks.filter(task => task.completed).length,
		0
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
									<BreadcrumbPage className="line-clamp-1">
										Dashboard
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="ml-auto flex items-center gap-3 px-3">
						<NavActions />
					</div>
				</header>

				<div className="flex flex-1 flex-col gap-6 p-6">
					{/* Welcome Section */}
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">Welcome back 👋</h1>
						<p className="text-muted-foreground">
							Here's an overview of your todo lists.
						</p>
					</div>

					{/* Stats Cards */}
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Lists
								</CardTitle>
								<Badge variant="secondary">{totalLists}</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalLists}</div>
								<p className="text-xs text-muted-foreground">
									Active todo lists
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Tasks
								</CardTitle>
								<Badge variant="secondary">{totalTasks}</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalTasks}</div>
								<p className="text-xs text-muted-foreground">Across all lists</p>
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

					{/* Lists Table */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">Your Lists</h2>
							<CreateDialog
								defaultMode="list"
								trigger={
									<Button size="sm">
										<Plus className="h-4 w-4 mr-2" />
										Create List
									</Button>
								}
							/>
						</div>

						{userLists.length === 0 ? (
							<Card className="p-12 text-center">
								<div className="mx-auto w-fit">
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
										<Plus className="h-6 w-6 text-muted-foreground" />
									</div>
									<h3 className="mt-4 text-lg font-semibold">No lists yet</h3>
									<p className="mt-2 text-sm text-muted-foreground">
										Create your first list to start organizing your tasks.
									</p>
									<CreateDialog
										defaultMode="list"
										trigger={
											<Button className="mt-4" size="sm">
												<Plus className="h-4 w-4 mr-2" />
												Create your first list
											</Button>
										}
									/>
								</div>
							</Card>
						) : (
							<Card>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>List Name</TableHead>
											<TableHead>Tasks</TableHead>
											<TableHead>Completed</TableHead>
											<TableHead>Progress</TableHead>
											<TableHead>Created</TableHead>
											<TableHead className="w-[100px]">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{userLists.map((list) => {
											const taskCount = list.tasks.length;
											const completedCount = list.tasks.filter(t => t.completed).length;
											const progressPercentage = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

											return (
												<TableRow key={list.id}>
													<TableCell className="font-medium">
														<Link
															href={`/lists/${list.id}`}
															className="hover:underline"
														>
															{list.title}
														</Link>
													</TableCell>
													<TableCell>
														<Badge variant="secondary">{taskCount}</Badge>
													</TableCell>
													<TableCell>
														<Badge 
															variant="secondary"
															className="bg-green-100 text-green-800"
														>
															{completedCount}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<div className="w-16 bg-secondary rounded-full h-2">
																<div
																	className="bg-primary h-2 rounded-full transition-all"
																	style={{
																		width: `${progressPercentage}%`,
																	}}
																/>
															</div>
															<span className="text-xs text-muted-foreground">
																{Math.round(progressPercentage)}%
															</span>
														</div>
													</TableCell>
													<TableCell className="text-muted-foreground">
														{new Date(list.createdAt).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem asChild>
																	<Link href={`/lists/${list.id}`}>
																		<ArrowRight className="h-4 w-4 mr-2" />
																		View Tasks
																	</Link>
																</DropdownMenuItem>
																<DropdownMenuItem>
																	<Edit2 className="h-4 w-4 mr-2" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem className="text-destructive">
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Card>
						)}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
