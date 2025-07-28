"use client"

import { ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface Task {
  id: string
  title: string
  completed: boolean
}

interface TodoList {
  id: string
  name: string
  url: string
  icon: string
  taskCount: number
  completedCount: number
  tasks: Task[]
}

interface NavTodoListsProps {
  todoLists: TodoList[]
}

export function NavTodoLists({ todoLists }: NavTodoListsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your Lists</SidebarGroupLabel>
      <SidebarMenu>
        {todoLists.map((list) => (
          <Collapsible key={list.id} asChild defaultOpen>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={list.name}>
                <Link href={list.url}>
                  <span className="text-base mr-2">{list.icon}</span>
                  <span className="flex-1 truncate">{list.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {list.completedCount}/{list.taskCount}
                  </span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side="bottom"
                  align="end"
                >
                  <DropdownMenuItem>
                    <span>Edit List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Add Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <span>Delete List</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {list.tasks.slice(0, 5).map((task) => (
                    <SidebarMenuSubItem key={task.id}>
                      <SidebarMenuSubButton asChild>
                        <Link href={`${list.url}/task/${task.id}`}>
                          <span className={`mr-2 text-xs ${
                            task.completed 
                              ? 'text-green-500' 
                              : 'text-muted-foreground'
                          }`}>
                            {task.completed ? '✓' : '○'}
                          </span>
                          <span className={`flex-1 truncate text-sm ${
                            task.completed 
                              ? 'line-through text-muted-foreground' 
                              : ''
                          }`}>
                            {task.title}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  {list.tasks.length > 5 && (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <Link href={list.url}>
                          <span className="text-xs text-muted-foreground">
                            +{list.tasks.length - 5} more tasks...
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
} 