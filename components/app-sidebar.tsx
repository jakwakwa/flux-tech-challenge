"use client"

import {
  CheckSquare,
  Home,
  List,
  Plus,
  Search,
  Settings2,
  Trash2,
  User,
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavTodoLists } from "@/components/nav-todo-lists"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Todo App Data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Search Tasks",
      url: "/search",
      icon: Search,
    },
    {
      title: "All Tasks",
      url: "/tasks",
      icon: CheckSquare,
      badge: "12",
    },
    {
      title: "Create List",
      url: "/lists/new",
      icon: Plus,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: Trash2,
    },
  ],
  todoLists: [
    {
      id: "1",
      name: "Work Projects",
      url: "/lists/work-projects",
      icon: "💼",
      taskCount: 8,
      completedCount: 3,
      tasks: [
        { id: "1", title: "Review project proposal", completed: true },
        { id: "2", title: "Update documentation", completed: false },
        { id: "3", title: "Schedule team meeting", completed: true },
        { id: "4", title: "Fix authentication bug", completed: false },
        { id: "5", title: "Deploy to staging", completed: false },
      ],
    },
    {
      id: "2", 
      name: "Personal Goals",
      url: "/lists/personal-goals",
      icon: "🎯",
      taskCount: 5,
      completedCount: 2,
      tasks: [
        { id: "6", title: "Read 2 books this month", completed: true },
        { id: "7", title: "Exercise 3 times a week", completed: false },
        { id: "8", title: "Learn TypeScript", completed: true },
        { id: "9", title: "Plan vacation", completed: false },
        { id: "10", title: "Organize home office", completed: false },
      ],
    },
    {
      id: "3",
      name: "Shopping List",
      url: "/lists/shopping",
      icon: "🛒",
      taskCount: 6,
      completedCount: 1,
      tasks: [
        { id: "11", title: "Buy groceries", completed: true },
        { id: "12", title: "Get new laptop charger", completed: false },
        { id: "13", title: "Pick up dry cleaning", completed: false },
        { id: "14", title: "Buy birthday gift", completed: false },
      ],
    },
    {
      id: "4",
      name: "Home Improvement",
      url: "/lists/home-improvement", 
      icon: "🏠",
      taskCount: 4,
      completedCount: 0,
      tasks: [
        { id: "15", title: "Paint living room", completed: false },
        { id: "16", title: "Fix leaky faucet", completed: false },
        { id: "17", title: "Install new light fixtures", completed: false },
        { id: "18", title: "Organize garage", completed: false },
      ],
    },
    {
      id: "5",
      name: "Learning & Development",
      url: "/lists/learning",
      icon: "📚",
      taskCount: 7,
      completedCount: 4,
      tasks: [
        { id: "19", title: "Complete React course", completed: true },
        { id: "20", title: "Practice algorithm problems", completed: true },
        { id: "21", title: "Read design patterns book", completed: false },
        { id: "22", title: "Build portfolio project", completed: true },
        { id: "23", title: "Write technical blog post", completed: false },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="p-2">
          <h2 className="text-lg font-semibold px-2">Todo Lists</h2>
        </div>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavTodoLists todoLists={data.todoLists} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
