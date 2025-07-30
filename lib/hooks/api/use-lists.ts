import { useState, useEffect, useCallback } from 'react';
import { List, ApiResponse } from '@/lib/types';
import { CreateListInput, UpdateListInput } from '@/lib/validators';
import { ApiErrorResponse } from '@/lib/utils/api-response';

interface UseListsReturn {
  lists: List[];
  loading: boolean;
  error: string | null;
  createList: (data: CreateListInput) => Promise<void>;
  updateList: (listId: string, data: UpdateListInput) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useLists(): UseListsReturn {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/lists');
      const data: ApiResponse<List[]> = await response.json();
      
      if (!response.ok) {
        const errorData = data as any;
        throw new Error(errorData?.error?.message || 'Failed to fetch lists');
      }
      
      const successData = data as any;
      if (!successData.success) {
        throw new Error('Failed to fetch lists');
      }
      
      if ('data' in data) {
        setLists(data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(async (data: CreateListInput) => {
    try {
      setError(null);
      
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<List> = await response.json();
      
      if (!response.ok) {
        const errorData = result as any;
        throw new Error(errorData?.error?.message || 'Failed to create list');
      }
      
      const successData = result as any;
      if (!successData.success) {
        throw new Error('Failed to create list');
      }
      
      // Optimistically update the local state
      if ('data' in result && result.data) {
        setLists(prev => [result.data as List, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating list:', err);
      throw err; // Re-throw to allow handling in components
    }
  }, []);

  const updateList = useCallback(async (listId: string, data: UpdateListInput) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/lists?listId=${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<List> = await response.json();
      
      if (!response.ok) {
        const errorData = result as any;
        throw new Error(errorData?.error?.message || 'Failed to update list');
      }
      
      const successData = result as any;
      if (!successData.success) {
        throw new Error('Failed to update list');
      }
      
      // Update the local state
      if ('data' in result && result.data) {
        setLists(prev => prev.map(list => 
          list.id === listId ? result.data as List : list
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating list:', err);
      throw err;
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/lists?listId=${listId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse = await response.json();
      
      if (!response.ok) {
        const errorData = result as any;
        throw new Error(errorData?.error?.message || 'Failed to delete list');
      }
      
      const successData = result as any;
      if (!successData.success) {
        throw new Error('Failed to delete list');
      }
      
      // Remove from local state
      setLists(prev => prev.filter(list => list.id !== listId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting list:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists,
  };
}