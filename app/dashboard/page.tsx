import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { NavActions } from "@/components/nav-actions"
import { TaskTableClient } from "@/components/task-table-client"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import prisma from '@/lib/prisma'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  
  // Ensure user exists in database (create if not exists)
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
    },
    create: {
      id: userId,
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
    },
  })
  
  // Fetch user's tasks with list information
  const userTasks = await prisma.task.findMany({
    where: {
      list: {
        userId: userId,
      },
    },
    include: {
      list: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limit to recent 20 tasks for dashboard
  })

  // Fetch user's lists for stats
  const userLists = await prisma.list.findMany({
    where: {
      userId: userId,
    },
    include: {
      tasks: true,
    },
  })

  // Transform data for TaskTable
  const tasksForTable = userTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    completed: task.completed,
    listId: task.listId,
    listName: task.list.title,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }))

  // Calculate stats
  const totalTasks = userTasks.length
  const completedTasks = userTasks.filter(task => task.completed).length
  const totalLists = userLists.length
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
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your tasks today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
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
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Badge variant="secondary">{totalTasks}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Recent tasks
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Tasks completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Table */}
          <div className="space-y-4">
            <TaskTableClient initialTasks={tasksForTable} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
