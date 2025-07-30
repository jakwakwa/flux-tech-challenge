// Database Models
export interface User {
	id: string;
	email: string;
	password?: string | null;
	name?: string | null;
	createdAt: Date;
	updatedAt: Date;
	lists?: List[];
}

export interface List {
	id: string;
	title: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	user?: User;
	tasks?: Task[];
}

export interface Task {
	id: string;
	title: string;
	description?: string | null;
	completed: boolean;
	listId: string;
	createdAt: Date;
	updatedAt: Date;
	list?: List;
}

// API Request/Response Types
export interface CreateListRequest {
	title: string;
}

export interface UpdateListRequest {
	title: string;
}

export interface CreateTaskRequest {
	title: string;
	description?: string;
	listId: string;
}

export interface UpdateTaskRequest {
	title?: string;
	description?: string;
	completed?: boolean;
	listId?: string;
}

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
	query?: string;
	listId?: string;
	completed?: boolean;
}

export interface SearchFilters {
	listId?: string;
	completed?: boolean;
	sortBy?: "createdAt" | "updatedAt" | "title" | "completed";
	sortOrder?: "asc" | "desc";
}

// UI Component Types
export interface TaskTableData {
	id: string;
	title: string;
	description?: string;
	completed: boolean;
	listId: string;
	listName: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DashboardStats {
	totalLists: number;
	totalTasks: number;
	completedTasks: number;
	completionRate: number;
}
