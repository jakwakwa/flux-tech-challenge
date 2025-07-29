// lib/cache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache key generators
  static getUserListsKey(userId: string): string {
    return `user:${userId}:lists`;
  }

  static getUserTasksKey(userId: string, listId?: string): string {
    return listId 
      ? `user:${userId}:list:${listId}:tasks`
      : `user:${userId}:tasks`;
  }

  static getUserStatsKey(userId: string): string {
    return `user:${userId}:stats`;
  }

  static getListKey(listId: string): string {
    return `list:${listId}`;
  }

  static getTaskKey(taskId: string): string {
    return `task:${taskId}`;
  }
}

export const cache = new Cache();
export { Cache };