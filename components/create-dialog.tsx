"use client"

import {
  CheckSquare,
  List,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Textarea } from "./ui/textarea"

// Textarea component will be added when available

interface CreateDialogProps {
  trigger?: React.ReactNode
  defaultMode?: "task" | "list"
}

interface TodoList {
  id: string
  title: string
}

const navigationData = [
  { 
    name: "Create Task", 
    icon: CheckSquare, 
    value: "task" as const 
  },
  { 
    name: "Create List", 
    icon: List, 
    value: "list" as const 
  },
]

export function CreateDialog({ trigger, defaultMode = "task" }: CreateDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [activeMode, setActiveMode] = React.useState<"task" | "list">(defaultMode)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  // Task form state
  const [taskTitle, setTaskTitle] = React.useState("")
  const [taskDescription, setTaskDescription] = React.useState("")
  const [selectedListId, setSelectedListId] = React.useState("")

  // List form state
  const [listTitle, setListTitle] = React.useState("")

  // Available lists (this could come from props or a hook)
  const [availableLists, setAvailableLists] = React.useState<TodoList[]>([])

  const fetchLists = React.useCallback(async () => {
    try {
      const response = await fetch('/api/lists')
      if (response.ok) {
        const lists = await response.json()
        setAvailableLists(lists)
      }
    } catch (error) {
      console.error('Error fetching lists:', error)
    }
  }, [])

  // Fetch available lists when dialog opens and task mode is selected
  React.useEffect(() => {
    if (open && activeMode === "task") {
      fetchLists()
    }
  }, [open, activeMode, fetchLists])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !selectedListId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          listId: selectedListId,
        }),
      })

      if (response.ok) {
        // Reset form
        setTaskTitle("")
        setTaskDescription("")
        setSelectedListId("")
        setOpen(false)
        router.refresh()
      } else {
        const errorText = await response.text()
        console.error('Failed to create task:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listTitle.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: listTitle.trim(),
        }),
      })

      if (response.ok) {
        // Reset form
        setListTitle("")
        setOpen(false)
        router.refresh()
      } else {
        const errorText = await response.text()
        console.error('Failed to create list:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">
          Create {activeMode === "task" ? "Task" : "List"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create a new {activeMode === "task" ? "task" : "list"} for your todo list application.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationData.map((item) => (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton
                          isActive={activeMode === item.value}
                          onClick={() => setActiveMode(item.value)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[500px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      Create
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {activeMode === "task" ? "New Task" : "New List"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              {activeMode === "task" ? (
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="Enter task title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Add a description (optional)..."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task-list">List *</Label>
                    <Select value={selectedListId} onValueChange={setSelectedListId}>
                      <SelectTrigger id="task-list">
                        <SelectValue placeholder="Select a list..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableLists.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No lists available. Create a list first.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading || !taskTitle.trim() || !selectedListId}>
                      {isLoading ? "Creating..." : "Create Task"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateList} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="list-title">List Title *</Label>
                    <Input
                      id="list-title"
                      placeholder="Enter list title..."
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">List Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Organize tasks by category or project</li>
                      <li>• Track progress with completion statistics</li>
                      <li>• Easy task management within each list</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading || !listTitle.trim()}>
                      {isLoading ? "Creating..." : "Create List"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
} 