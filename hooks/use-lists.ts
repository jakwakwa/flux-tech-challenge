// hooks/use-lists.ts
import { useState, useCallback } from 'react';
import { List, CreateListRequest, UpdateListRequest } from '@/lib/types';

interface UseListsOptions {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function useLists(options: UseListsOptions = {}) {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lists');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch lists');
      }
      
      setLists(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lists';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const createList = useCallback(async (listData: CreateListRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create list');
      }
      
      setLists(prev => [result.data, ...prev]);
      options.onSuccess?.('List created successfully');
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create list';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const updateList = useCallback(async (listId: string, updates: UpdateListRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lists', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listId, title: updates.title }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update list');
      }
      
      setLists(prev => 
        prev.map(list => 
          list.id === listId ? { ...list, ...result.data } : list
        )
      );
      options.onSuccess?.('List updated successfully');
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update list';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const deleteList = useCallback(async (listId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/lists?listId=${listId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete list');
      }
      
      setLists(prev => prev.filter(list => list.id !== listId));
      options.onSuccess?.('List deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete list';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
    clearError,
  };
}