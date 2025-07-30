'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/lib/store/use-task-store';
import { useUIStore } from '@/lib/store/use-ui-store';
import { TaskTable } from '@/components/task-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateDialog, EditTaskDialog } from '@/components/create-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ListPageClientProps {
  listId: string;
  listTitle: string;
}

export function ListPageClient({ listId, listTitle }: ListPageClientProps) {
  const { tasks, updateTask, deleteTask, toggleTaskComplete } = useTaskStore();
  const { addToast } = useUIStore();

  // Filter tasks for this specific list from the store
  const listTasks = useMemo(() => {
    return tasks.filter(task => task.listId === listId);
  }, [tasks, listId]);

  // Transform tasks for TaskTable
  const tasksForTable = listTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    completed: task.completed,
    listId: task.listId,
    listName: listTitle,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  // Calculate task stats for this list
  const totalTasks = listTasks.length;
  const completedTasks = listTasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Task action handlers
  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates);
      addToast({
        type: 'success',
        title: 'Task updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to update task',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      addToast({
        type: 'success',
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to delete task',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleTaskEdit = (task: any) => {
    // This will be handled by the TaskTable internally with EditTaskDialog
  };

  // Create task button for the TaskTable
  const createTaskButton = (
    <CreateDialog
      defaultMode="task"
      currentListId={listId}
      trigger={
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      }
    />
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tasks
            </CardTitle>
            <Badge variant="secondary">{totalTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks in this list
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tasks
            </CardTitle>
            <Badge variant="secondary">{pendingTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800"
            >
              {totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0}
              %
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Table */}
      <div className="space-y-4">
        <TaskTable
          tasks={tasksForTable}
          title={`${listTitle} - Tasks`}
          createDialog={createTaskButton}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskEdit={handleTaskEdit}
        />
      </div>
    </>
  );
}