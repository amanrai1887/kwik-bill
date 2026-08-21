import Redis from 'ioredis';
import { config } from '../config/app.config.ts';

declare global {
  var _redisClient: Redis | undefined;
}

let isRedisConnected = false;
let hasLoggedFailure = false;

export const createRedisClient = (): Redis | null => {
  if (!config.redis.enabled) {
    return null;
  }

  if (global._redisClient) {
    return global._redisClient;
  }

  try {
    const client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 5) {
          if (!hasLoggedFailure) {
            console.warn('[Redis] Max reconnect attempts reached. Operating in cache-bypass mode.');
            hasLoggedFailure = true;
          }
          return null; // stop retrying
        }
        return Math.min(times * 500, 2000);
      },
      connectTimeout: 5000,
      lazyConnect: false,
      enableOfflineQueue: false,
    });

    client.on('connect', () => {
      isRedisConnected = true;
      hasLoggedFailure = false;
      console.log(`[Redis] Connected successfully to ${config.redis.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    });

    client.on('ready', () => {
      isRedisConnected = true;
    });

    client.on('error', (err: any) => {
      isRedisConnected = false;
      if (!hasLoggedFailure) {
        console.warn(`[Redis] Connection warning (${err?.code || err?.message || 'Offline'}). Falling back to direct database.`);
        hasLoggedFailure = true;
      }
    });

    client.on('close', () => {
      isRedisConnected = false;
    });

    global._redisClient = client;
    return client;
  } catch (err) {
    console.warn('[Redis] Failed to initialize Redis client:', err);
    return null;
  }
};

export const redis = createRedisClient();

export const isCacheAvailable = (): boolean => {
  return isRedisConnected && redis !== null && redis.status === 'ready';
};

/**
 * Get cached JSON value by key
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!isCacheAvailable() || !redis) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.debug(`[Redis] getCache error for key "${key}":`, err);
    return null;
  }
}

/**
 * Set JSON cache with TTL in seconds
 */
export async function setCache(key: string, data: any, ttlSeconds = 180): Promise<boolean> {
  if (!isCacheAvailable() || !redis) return false;
  try {
    const serialized = JSON.stringify(data);
    if (ttlSeconds > 0) {
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (err) {
    console.debug(`[Redis] setCache error for key "${key}":`, err);
    return false;
  }
}

/**
 * Invalidate specific cache keys
 */
export async function invalidateCache(...keys: string[]): Promise<boolean> {
  if (!isCacheAvailable() || !redis || keys.length === 0) return false;
  try {
    const filtered = keys.filter(Boolean);
    if (filtered.length === 0) return false;
    await redis.del(...filtered);
    return true;
  } catch (err) {
    console.debug(`[Redis] invalidateCache error:`, err);
    return false;
  }
}

/**
 * Invalidate keys matching a pattern using SCAN to avoid blocking Redis
 */
export async function invalidatePattern(pattern: string): Promise<number> {
  if (!isCacheAvailable() || !redis) return 0;
  try {
    let cursor = '0';
    let deletedCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');
    return deletedCount;
  } catch (err) {
    console.debug(`[Redis] invalidatePattern error for "${pattern}":`, err);
    return 0;
  }
}

/**
 * Invalidate cache for a specific user across specified resources (or all if omitted)
 */
export async function invalidateUserCache(userId: number | string, ...resources: string[]): Promise<void> {
  if (!isCacheAvailable() || !redis || !userId) return;

  try {
    if (resources.length === 0) {
      // Invalidate everything for this user
      await invalidatePattern(`cache:${userId}:*`);
    } else {
      // Invalidate specific resources for this user (including sub-keys with params/filters)
      const tasks = resources.map((res) => invalidatePattern(`cache:${userId}:${res}*`));
      await Promise.all(tasks);
    }
  } catch (err) {
    console.debug(`[Redis] invalidateUserCache error for user ${userId}:`, err);
  }
}

/**
 * Invalidate admin cache resources
 */
export async function invalidateAdminCache(...resources: string[]): Promise<void> {
  if (!isCacheAvailable() || !redis) return;
  try {
    if (resources.length === 0) {
      await invalidatePattern(`cache:admin:*`);
    } else {
      const tasks = resources.map((res) => invalidatePattern(`cache:admin:${res}*`));
      await Promise.all(tasks);
    }
  } catch (err) {
    console.debug(`[Redis] invalidateAdminCache error:`, err);
  }
}

/**
 * Flush all cache keys (admin utility)
 */
export async function flushAllCache(): Promise<boolean> {
  if (!isCacheAvailable() || !redis) return false;
  try {
    // Delete all keys with 'cache:*' pattern to avoid clearing unrelated DB keys if shared
    await invalidatePattern('cache:*');
    return true;
  } catch (err) {
    console.debug(`[Redis] flushAllCache error:`, err);
    return false;
  }
}

/**
 * Get statistics and health of Redis cache
 */
export async function getCacheStats(): Promise<{
  isConnected: boolean;
  status: string;
  keysCount: number;
  memoryUsed: string;
  uptimeSeconds: number;
  redisVersion: string;
}> {
  const defaultStats = {
    isConnected: false,
    status: redis?.status || 'disconnected',
    keysCount: 0,
    memoryUsed: '0 MB',
    uptimeSeconds: 0,
    redisVersion: 'unknown',
  };

  if (!isCacheAvailable() || !redis) {
    return defaultStats;
  }

  try {
    const info = await redis.info();
    const parseInfo = (section: string, key: string): string => {
      const match = section.match(new RegExp(`^${key}:(.+)$`, 'm'));
      return match ? match[1].trim() : '';
    };

    const redisVersion = parseInfo(info, 'redis_version') || 'unknown';
    const usedMemoryHuman = parseInfo(info, 'used_memory_human') || '0 MB';
    const uptime = parseInt(parseInfo(info, 'uptime_in_seconds') || '0', 10);

    // Count cached keys matching cache:*
    let cursor = '0';
    let keysCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'cache:*', 'COUNT', 100);
      cursor = nextCursor;
      keysCount += keys.length;
    } while (cursor !== '0');

    return {
      isConnected: true,
      status: redis.status,
      keysCount,
      memoryUsed: usedMemoryHuman,
      uptimeSeconds: uptime,
      redisVersion,
    };
  } catch (err) {
    console.debug('[Redis] getCacheStats error:', err);
    return defaultStats;
  }
}
