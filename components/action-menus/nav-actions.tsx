"use client";

import { UserButton } from "@clerk/nextjs";
import { List, MoreHorizontal, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { CreateDialog, EditListDialog } from "@/components/create-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = [
	{
		id: "list-actions",
		items: [
			{
				id: "create-list",
				label: "Create New List",
				icon: Plus,
			},
			{
				id: "view-all-lists",
				label: "View All Lists",
				icon: List,
			},
		],
	},
];

interface NavActionsProps {
	selectedList?: {
		id: string;
		title: string;
	} | null;
}

export function NavActions({ selectedList }: NavActionsProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const [editDialogOpen, setEditDialogOpen] = React.useState(false);
	const router = useRouter();
	const pathname = usePathname();

	// Filter items based on current route
	const getVisibleItems = () => {
		const isDashboard = pathname === "/dashboard";
		const isListPage = pathname.startsWith("/lists/");

		return data[0].items.filter((item) => {
			switch (item.id) {
				case "view-all-lists":
					// Hide "View All Lists" when on dashboard
					return !isDashboard;
				case "edit-list":
					// Only show "Edit List" when on a list page and selectedList exists
					return isListPage && selectedList;
				case "create-list":
					// Always show "Create New List"
					return true;
				default:
					return true;
			}
		});
	};

	const handleMenuItemClick = (itemId: string) => {
		setIsOpen(false);

		switch (itemId) {
			case "create-list":
				setCreateDialogOpen(true);
				break;
			case "edit-list":
				if (selectedList) {
					setEditDialogOpen(true);
				}
				break;
			case "view-all-lists":
				router.push("/dashboard");
				break;
		}
	};

	return (
		<>
			<div className="flex items-center gap-2 text-sm">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 data-[state=open]:bg-accent"
						>
							<MoreHorizontal />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-56 overflow-hidden rounded-lg p-0"
						align="end"
					>
						<Sidebar collapsible="none" className="bg-transparent">
							<SidebarContent>
								<SidebarGroup className="border-b last:border-none">
									<SidebarGroupContent className="gap-0">
										<SidebarMenu>
											{getVisibleItems().map((item) => (
												<SidebarMenuItem key={item.id}>
													<SidebarMenuButton
														onClick={() => handleMenuItemClick(item.id)}
														disabled={item.id === "edit-list" && !selectedList}
													>
														<item.icon /> <span>{item.label}</span>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</SidebarGroup>
							</SidebarContent>
						</Sidebar>
					</PopoverContent>
				</Popover>
				<ThemeSwitcher />
				<UserButton />
			</div>

			{/* Create Dialog */}
			<CreateDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				defaultMode="list"
			/>

			{/* Edit List Dialog */}
			{selectedList && (
				<EditListDialog
					list={selectedList}
					open={editDialogOpen}
					onOpenChange={setEditDialogOpen}
				/>
			)}
		</>
	);
}
