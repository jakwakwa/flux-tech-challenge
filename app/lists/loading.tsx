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

export default function ListLoading() {
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
							<Skeleton className="h-4 w-64" />
						</div>
						<div className="ml-auto flex items-center gap-3 px-3">
							<NavActions />
						</div>
					</header>

					<div className="flex flex-1 flex-col gap-6 p-6">
						{/* Back Button Skeleton */}
						<div className="flex items-center gap-4">
							<Skeleton className="h-9 w-32" />
						</div>

						{/* Task Details Skeleton */}
						<div className="space-y-6">
							{/* Task Header */}
							<div className="space-y-4">
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<Skeleton className="h-9 w-96" />
										<div className="flex items-center gap-4">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-40" />
											<Skeleton className="h-4 w-40" />
										</div>
									</div>
									<Skeleton className="h-6 w-20 rounded-full" />
								</div>
							</div>

							{/* Description Card */}
							<div className="rounded-lg border bg-card">
								<div className="p-6">
									<Skeleton className="h-6 w-32 mb-4" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								</div>
							</div>

							{/* Actions Card */}
							<div className="rounded-lg border bg-card">
								<div className="p-6">
									<Skeleton className="h-6 w-24 mb-4" />
									<div className="flex gap-3">
										<Skeleton className="h-10 w-28" />
										<Skeleton className="h-10 w-40" />
										<Skeleton className="h-10 w-32" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
