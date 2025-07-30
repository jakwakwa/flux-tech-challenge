import { NavActions } from "@/components/action-menus/nav-actions";
import { AppSidebar } from "@/components/app-sidebar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<>
			<ProgressBar />
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-14 shrink-0 items-center gap-2">
						<div className="flex flex-1 items-center gap-2 px-3">
							<SidebarTrigger />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<Skeleton className="h-4 w-24" />
						</div>
						<div className="ml-auto flex items-center gap-3 px-3">
							<NavActions />
						</div>
					</header>

					<div className="flex flex-1 flex-col gap-6 p-6">
						{/* Stats Skeleton */}
						<div className="grid gap-4 md:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="rounded-lg border bg-card p-6">
									<div className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-8 w-16" />
									</div>
								</div>
							))}
						</div>

						{/* Lists Grid Skeleton */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Skeleton className="h-8 w-32" />
								<Skeleton className="h-10 w-32" />
							</div>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div key={i} className="rounded-lg border bg-card p-6">
										<div className="space-y-4">
											<div className="flex items-start justify-between">
												<Skeleton className="h-6 w-32" />
												<Skeleton className="h-6 w-6 rounded" />
											</div>
											<Skeleton className="h-4 w-20" />
											<div className="flex justify-end gap-2">
												<Skeleton className="h-8 w-16" />
												<Skeleton className="h-8 w-16" />
												<Skeleton className="h-8 w-16" />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
