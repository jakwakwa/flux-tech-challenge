// lib/services/database.ts
import { auth } from '@clerk/nextjs/server';
import { AuthenticationError, NotFoundError, ValidationError } from '../errors';
import prisma from '../prisma';
import { APP_LIMITS } from '../constants';
import { cache, Cache } from '../cache';

export class DatabaseService {
  /**
   * Get the authenticated user ID or throw an error
   */
  static async getAuthenticatedUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }
    return userId;
  }

  /**
   * Ensure user exists in database (create if not exists)
   */
  static async ensureUserExists(userId: string, userData?: { email?: string; name?: string }) {
    return await prisma.user.upsert({
      where: { id: userId },
      update: {
        ...(userData?.email && { email: userData.email }),
        ...(userData?.name && { name: userData.name }),
      },
      create: {
        id: userId,
        email: userData?.email || '',
        name: userData?.name || null,
      },
    });
  }

  /**
   * Get user's lists with task counts
   */
  static async getUserLists(userId: string) {
    const cacheKey = Cache.getUserListsKey(userId);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    cache.set(cacheKey, lists);
    return lists;
  }

  /**
   * Get a specific list with tasks
   */
  static async getListWithTasks(listId: string, userId: string) {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!list) {
      throw new NotFoundError('List');
    }

    return list;
  }

  /**
   * Create a new list
   */
  static async createList(userId: string, title: string) {
    // Check list limit
    const existingListsCount = await prisma.list.count({
      where: { userId },
    });

    if (existingListsCount >= APP_LIMITS.MAX_LISTS_PER_USER) {
      throw new ValidationError(
        `You have reached the maximum limit of ${APP_LIMITS.MAX_LISTS_PER_USER} lists. Please delete some lists before creating new ones.`
      );
    }

    const list = await prisma.list.create({
      data: {
        title: title.trim(),
        userId,
      },
      include: {
        tasks: true,
      },
    });

    // Invalidate cache
    cache.delete(Cache.getUserListsKey(userId));

    return list;
  }

  /**
   * Update a list
   */
  static async updateList(listId: string, userId: string, title: string) {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!list) {
      throw new NotFoundError('List');
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: { title: title.trim() },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Invalidate cache
    cache.delete(Cache.getUserListsKey(userId));
    cache.delete(Cache.getListKey(listId));

    return updatedList;
  }

  /**
   * Delete a list
   */
  static async deleteList(listId: string, userId: string) {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!list) {
      throw new NotFoundError('List');
    }

    await prisma.list.delete({
      where: { id: listId },
    });

    // Invalidate cache
    cache.delete(Cache.getUserListsKey(userId));
    cache.delete(Cache.getListKey(listId));
    cache.delete(Cache.getUserTasksKey(userId));
  }

  /**
   * Get user's tasks with list information
   */
  static async getUserTasks(userId: string, listId?: string) {
    const cacheKey = Cache.getUserTasksKey(userId, listId);
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const tasks = await prisma.task.findMany({
      where: {
        list: {
          userId,
          ...(listId && { id: listId }),
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    cache.set(cacheKey, tasks);
    return tasks;
  }

  /**
   * Get a specific task
   */
  static async getTask(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: { userId },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  /**
   * Create a new task
   */
  static async createTask(userId: string, data: { title: string; description?: string; listId: string }) {
    // Verify the list belongs to the user
    const list = await prisma.list.findFirst({
      where: {
        id: data.listId,
        userId,
      },
    });

    if (!list) {
      throw new NotFoundError('List');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        listId: data.listId,
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Invalidate cache
    cache.delete(Cache.getUserTasksKey(userId));
    cache.delete(Cache.getUserTasksKey(userId, data.listId));
    cache.delete(Cache.getUserListsKey(userId));

    return task;
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: string, userId: string, updates: Partial<{ title: string; description: string; completed: boolean }>) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: { userId },
      },
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updates,
      include: {
        list: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Invalidate cache
    cache.delete(Cache.getUserTasksKey(userId));
    cache.delete(Cache.getUserTasksKey(userId, task.listId));
    cache.delete(Cache.getTaskKey(taskId));

    return updatedTask;
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: { userId },
      },
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    // Invalidate cache
    cache.delete(Cache.getUserTasksKey(userId));
    cache.delete(Cache.getUserTasksKey(userId, task.listId));
    cache.delete(Cache.getTaskKey(taskId));
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string) {
    const [totalLists, totalTasks, completedTasks] = await Promise.all([
      prisma.list.count({ where: { userId } }),
      prisma.task.count({
        where: {
          list: { userId },
        },
      }),
      prisma.task.count({
        where: {
          list: { userId },
          completed: true,
        },
      }),
    ]);

    return {
      totalLists,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }
}