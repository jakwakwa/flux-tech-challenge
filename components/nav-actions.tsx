"use client";

import { UserButton } from "@clerk/nextjs";
import { Edit3, List, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
				id: "edit-list",
				label: "Edit List",
				icon: Edit3,
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
								{data.map((group) => (
									<SidebarGroup
										key={group.id}
										className="border-b last:border-none"
									>
										<SidebarGroupContent className="gap-0">
											<SidebarMenu>
												{group.items.map((item) => (
													<SidebarMenuItem key={item.id}>
														<SidebarMenuButton
															onClick={() => handleMenuItemClick(item.id)}
															disabled={
																item.id === "edit-list" && !selectedList
															}
														>
															<item.icon /> <span>{item.label}</span>
														</SidebarMenuButton>
													</SidebarMenuItem>
												))}
											</SidebarMenu>
										</SidebarGroupContent>
									</SidebarGroup>
								))}
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
