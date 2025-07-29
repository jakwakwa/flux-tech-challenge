'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useListStore } from '@/lib/store/use-list-store';
import { useTaskStore } from '@/lib/store/use-task-store';
import { useUIStore } from '@/lib/store/use-ui-store';
import { DashboardStats } from './dashboard-stats';
import { ListGrid } from './list-grid';
import { TaskView } from './task-view';
import { WelcomeSection } from './welcome-section';
import { DashboardStatsSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/error-boundary';

export function DashboardClient() {
  const searchParams = useSearchParams();
  const listId = searchParams.get('listId');

  // Zustand stores
  const { 
    lists, 
    selectedListId, 
    isLoading: listsLoading, 
    fetchLists, 
    selectList,
    getSelectedList 
  } = useListStore();
  
  const { 
    tasks, 
    isLoading: tasksLoading, 
    fetchTasks, 
    setFilters,
    getTaskStats 
  } = useTaskStore();
  
  const { addToast } = useUIStore();

  // Set selected list from URL
  useEffect(() => {
    selectList(listId);
    if (listId) {
      setFilters({ listId });
    } else {
      setFilters({ listId: undefined });
    }
  }, [listId, selectList, setFilters]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchLists(),
          fetchTasks()
        ]);
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Failed to load data',
          description: error instanceof Error ? error.message : 'Please try refreshing the page',
        });
      }
    };

    loadData();
  }, [fetchLists, fetchTasks, addToast]);

  const selectedList = getSelectedList();
  const stats = getTaskStats();
  const isLoading = listsLoading || tasksLoading;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ErrorBoundary>
        {/* Welcome Section */}
        <WelcomeSection selectedList={selectedList} />

        {/* Stats Cards */}
        {isLoading ? (
          <DashboardStatsSkeleton />
        ) : (
          <DashboardStats
            totalLists={lists.length}
            totalTasks={stats.total}
            completedTasks={stats.completed}
          />
        )}

        {/* Main Content */}
        {selectedList ? (
          // Show tasks for selected list
          <TaskView 
            listId={selectedList.id}
            listTitle={selectedList.title}
          />
        ) : (
          // Show all lists
          <ListGrid />
        )}
      </ErrorBoundary>
    </div>
  );
}