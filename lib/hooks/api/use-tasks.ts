import { useState, useEffect, useCallback } from 'react';
import { Task, ApiResponse, SearchParams } from '@/lib/types';
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validators';

interface UseTasksOptions extends SearchParams {
  enabled?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  createTask: (data: CreateTaskInput) => Promise<void>;
  updateTask: (taskId: string, data: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const { enabled = true, ...searchParams } = options;

  const fetchTasks = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/tasks?${params}`);
      const data: ApiResponse<Task[]> = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch tasks');
      }
      
      setTasks(data.data || []);
      setTotalPages(data.meta?.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, searchParams]);

  const createTask = useCallback(async (data: CreateTaskInput) => {
    try {
      setError(null);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Task> = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create task');
      }
      
      // If the new task matches current filters, add it to the list
      if (!searchParams.listId || searchParams.listId === data.listId) {
        setTasks(prev => [result.data!, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating task:', err);
      throw err;
    }
  }, [searchParams.listId]);

  const updateTask = useCallback(async (taskId: string, data: UpdateTaskInput) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<Task> = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update task');
      }
      
      // Update the local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? result.data! : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating task:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete task');
      }
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting task:', err);
      throw err;
    }
  }, []);

  const toggleComplete = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { completed: !task.completed });
  }, [tasks, updateTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    totalPages,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refetch: fetchTasks,
  };
}