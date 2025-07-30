"use client";

import { useEffect } from "react";
import { useListStore } from "@/lib/store/use-list-store";
import { useTaskStore } from "@/lib/store/use-task-store";
import type { List, Task } from "@/lib/types";

interface StoreInitializerProps {
	lists?: List[];
	tasks?: Task[];
}

export function StoreInitializer({ lists, tasks }: StoreInitializerProps) {
	const { lists: currentLists } = useListStore();
	const { tasks: currentTasks } = useTaskStore();

	useEffect(() => {
		// Only initialize lists if store is empty, hasn't been modified, and we have server data
		const storeState = useListStore.getState();
		if (
			lists &&
			lists.length > 0 &&
			currentLists.length === 0 &&
			!storeState.hasBeenModified
		) {
			// Initialize the store with server data by setting the state directly
			useListStore.setState({
				lists,
				isLoading: false,
				totalCount: lists.length,
				currentPage: 1,
				totalPages: 1,
			});
		}
	}, [lists, currentLists.length]);

	useEffect(() => {
		// Only initialize tasks if store is empty and we have server data
		if (tasks && tasks.length > 0 && currentTasks.length === 0) {
			// Initialize the store with server data by setting the state directly
			useTaskStore.setState({
				tasks,
				isLoading: false,
				totalCount: tasks.length,
				currentPage: 1,
				totalPages: 1,
			});
		}
	}, [tasks, currentTasks.length]);

	// This component doesn't render anything
	return null;
}
