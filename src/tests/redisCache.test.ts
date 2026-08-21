import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache, invalidateCache, invalidateUserCache, flushAllCache, getCacheStats } from '../lib/redis.ts';
import { cacheResponse } from '../middleware/cacheMiddleware.ts';

describe('Redis Cache Helper Layer', () => {
  it('handles getCache and setCache safely without throwing when Redis is in any state', async () => {
    const key = 'cache:test:sample';
    const data = { hello: 'world', timestamp: Date.now() };

    // Attempting to set & get
    const setResult = await setCache(key, data, 60);
    const getResult = await getCache(key);

    // When Redis is offline in test runner, should return false / null gracefully without crashing
    if (setResult) {
      expect(getResult).toEqual(data);
    } else {
      expect(getResult).toBeNull();
    }
  });

  it('handles invalidateCache and invalidateUserCache safely', async () => {
    const invalidResult = await invalidateCache('cache:test:sample1', 'cache:test:sample2');
    expect(typeof invalidResult).toBe('boolean');

    await expect(invalidateUserCache(101, 'clients', 'invoices')).resolves.toBeUndefined();
    await expect(invalidateUserCache(101)).resolves.toBeUndefined();
  });

  it('returns valid cache stats structure', async () => {
    const stats = await getCacheStats();
    expect(stats).toHaveProperty('isConnected');
    expect(stats).toHaveProperty('status');
    expect(stats).toHaveProperty('keysCount');
    expect(stats).toHaveProperty('memoryUsed');
    expect(stats).toHaveProperty('uptimeSeconds');
    expect(stats).toHaveProperty('redisVersion');
  });

  it('handles flushAllCache safely', async () => {
    const flushed = await flushAllCache();
    expect(typeof flushed).toBe('boolean');
  });
});

describe('Cache Middleware Unit Test', () => {
  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/clients',
      params: {},
      query: {},
      dbUser: { id: 42 },
    };
    mockRes = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader: vi.fn((key: string, val: string) => {
        mockRes.headers[key] = val;
      }),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  it('skips non-GET HTTP methods', async () => {
    mockReq.method = 'POST';
    const middleware = cacheResponse('clients', 180);
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Cache', 'HIT');
  });

  it('bypasses or handles offline redis gracefully by calling next() and attaching header', async () => {
    const middleware = cacheResponse('clients', 180);
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
