"use client"

import {
  Archive,
  CheckSquare,
  Edit3,
  FileText,
  List,
  MoreHorizontal,
  Plus,
  Settings2,
  Star,
  Trash2,
} from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
  {
    id: "task-actions",
    items: [
      {
        id: "add-task",
        label: "Add Task",
        icon: Plus,
      },
      {
        id: "mark-completed",
        label: "Mark as Completed",
        icon: CheckSquare,
      },
      {
        id: "edit-task",
        label: "Edit Task",
        icon: Edit3,
      },
    ],
  },
  {
    id: "management-actions",
    items: [
      {
        id: "archive-completed",
        label: "Archive Completed",
        icon: Archive,
      },
      {
        id: "export-data",
        label: "Export Data",
        icon: FileText,
      },
      {
        id: "delete-list",
        label: "Delete List",
        icon: Trash2,
      },
    ],
  },
  {
    id: "view-settings",
    items: [
      {
        id: "list-settings",
        label: "List Settings",
        icon: Settings2,
      },
    ],
  },
]

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Edit Oct 08
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Star />
      </Button>
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
                <SidebarGroup key={group.id} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton>
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
    </div>
  )
}
