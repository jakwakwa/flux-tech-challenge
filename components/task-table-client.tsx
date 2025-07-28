"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { type Task, TaskTable } from "./task-table"

interface TaskTableClientProps {
  initialTasks: Task[]
}

export function TaskTableClient({ initialTasks }: TaskTableClientProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          ...updates,
        }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, ...updates }
              : task
          )
        )
        
        // Refresh the page to get updated data
        router.refresh()
      } else {
        console.error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
        
        // Refresh the page to get updated data
        router.refresh()
      } else {
        console.error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleCreateTask = () => {
    // For now, just navigate to a create page or open a modal
    // This could be enhanced to show a form modal
    router.push('/tasks/new')
  }

  return (
    <TaskTable
      tasks={tasks}
      onTaskUpdate={handleTaskUpdate}
      onTaskDelete={handleTaskDelete}
      onCreateTask={handleCreateTask}
    />
  )
} 