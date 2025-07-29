// lib/types.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
  list?: {
    id: string;
    title: string;
  };
}

export interface UserStats {
  totalLists: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

// API Request/Response types
export interface CreateListRequest {
  title: string;
}

export interface UpdateListRequest {
  listId: string;
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
}

// Component Props types
export interface TaskTableProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  createDialog?: React.ReactNode;
}

export interface ListCardProps {
  list: List;
  onEdit?: (list: List) => void;
  onDelete?: (listId: string) => void;
  isSelected?: boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Search and filter types
export interface TaskFilters {
  search?: string;
  completed?: boolean;
  listId?: string;
  sortBy?: 'createdAt' | 'title' | 'completed';
  sortOrder?: 'asc' | 'desc';
}

export interface ListFilters {
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'taskCount';
  sortOrder?: 'asc' | 'desc';
}