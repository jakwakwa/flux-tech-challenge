// lib/test-utils.ts
import { Task, List, User } from './types';

declare global {
  const jest: any;
}

export const mockUser: User = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockList: List = {
  id: 'list_123',
  title: 'Test List',
  userId: 'user_123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tasks: [],
};

export const mockTask: Task = {
  id: 'task_123',
  title: 'Test Task',
  description: 'Test description',
  completed: false,
  listId: 'list_123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  list: {
    id: 'list_123',
    title: 'Test List',
  },
};

export const mockLists: List[] = [
  mockList,
  {
    ...mockList,
    id: 'list_456',
    title: 'Another List',
  },
];

export const mockTasks: Task[] = [
  mockTask,
  {
    ...mockTask,
    id: 'task_456',
    title: 'Another Task',
    completed: true,
  },
];

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: !success ? { message: 'Test error' } : undefined,
});

// Mock fetch function for testing
export const mockFetch = (response: any, ok = true) => {
  if (typeof jest !== 'undefined') {
    return jest.fn().mockResolvedValue({
      ok,
      json: jest.fn().mockResolvedValue(response),
    });
  }
  return () => Promise.resolve({
    ok,
    json: () => Promise.resolve(response),
  });
};

// Test data generators
export const generateMockUser = (overrides: Partial<User> = {}): User => ({
  id: `user_${Math.random().toString(36).substr(2, 9)}`,
  email: `test${Math.random()}@example.com`,
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const generateMockList = (overrides: Partial<List> = {}): List => ({
  id: `list_${Math.random().toString(36).substr(2, 9)}`,
  title: `Test List ${Math.random().toString(36).substr(2, 5)}`,
  userId: 'user_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  tasks: [],
  ...overrides,
});

export const generateMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: `task_${Math.random().toString(36).substr(2, 9)}`,
  title: `Test Task ${Math.random().toString(36).substr(2, 5)}`,
  description: 'Test description',
  completed: false,
  listId: 'list_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  list: {
    id: 'list_123',
    title: 'Test List',
  },
  ...overrides,
});