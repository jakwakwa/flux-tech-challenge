// hooks/use-tasks.ts
import { useState, useCallback } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/types';

interface UseTasksOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (listId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = listId ? `/api/tasks?listId=${listId}` : '/api/tasks';
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch tasks');
      }
      
      setTasks(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create task');
      }
      
      setTasks(prev => [result.data, ...prev]);
      options.onSuccess?.('Task created successfully');
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const updateTask = useCallback(async (taskId: string, updates: UpdateTaskRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, ...updates }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update task');
      }
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...result.data } : task
        )
      );
      options.onSuccess?.('Task updated successfully');
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete task');
      }
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      options.onSuccess?.('Task deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean) => {
    return updateTask(taskId, { completed });
  }, [updateTask]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    clearError,
  };
}