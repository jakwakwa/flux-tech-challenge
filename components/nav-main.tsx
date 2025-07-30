"use client";

import {
	CheckSquare,
	Home,
	Inbox,
	MessageCircleQuestion,
	Plus,
	Search,
	Settings2,
	Sparkles,
	Trash2,
	User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const iconMap = {
	Home,
	Search,
	CheckSquare,
	Plus,
	User,
	Settings2,
	Trash2,
	Sparkles,
	Inbox,
	MessageCircleQuestion,
};

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: keyof typeof iconMap;
		isActive?: boolean;
		badge?: string;
	}[];
}) {
	return (
		<SidebarMenu>
			{items.map((item) => {
				const IconComponent = iconMap[item.icon];
				return (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild isActive={item.isActive}>
							<a href={item.url}>
								<IconComponent />
								<span>{item.title}</span>
								{item.badge && (
									<Badge
										variant="secondary"
										className="ml-auto h-5 px-1.5 text-xs"
									>
										{item.badge}
										shqhqubibqwb
									</Badge>
								)}
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
