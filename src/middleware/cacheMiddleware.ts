import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { getCache, setCache, isCacheAvailable } from '../lib/redis.ts';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 180)
  includeQueryParams?: boolean; // Whether to append query params to cache key (default: true)
  customKeyGenerator?: (req: AuthRequest) => string;
}

/**
 * Express middleware to cache GET responses in Redis.
 *
 * @param resourceName The logical resource identifier (e.g., 'clients', 'invoices', 'analytics')
 * @param ttlSeconds TTL in seconds (default: 180s)
 * @param options Additional caching configuration
 */
export const cacheResponse = (
  resourceName: string,
  ttlSeconds = 180,
  options: CacheOptions = {}
) => {
  const { includeQueryParams = true, customKeyGenerator } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // If cache is disabled or Redis is offline, bypass silently
    if (!isCacheAvailable()) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    try {
      // Build unique cache key
      let cacheKey: string;

      if (customKeyGenerator) {
        cacheKey = customKeyGenerator(req);
      } else {
        const userId = req.dbUser?.id;
        const isSuperAdminRoute = resourceName.startsWith('admin:') || req.originalUrl.includes('/admin/');
        
        let prefix: string;
        if (isSuperAdminRoute) {
          prefix = `cache:admin:${resourceName.replace('admin:', '')}`;
        } else if (userId) {
          prefix = `cache:${userId}:${resourceName}`;
        } else {
          prefix = `cache:public:${resourceName}`;
        }

        // Include route parameters (e.g. /:id or /:invoiceNumber)
        const paramsKey = Object.keys(req.params).length > 0 
          ? `:${Object.entries(req.params).map(([k, v]) => `${k}=${v}`).join('&')}` 
          : '';

        // Include query parameters (e.g. pagination, filters)
        let queryKey = '';
        if (includeQueryParams && Object.keys(req.query).length > 0) {
          const sortedQuery = Object.keys(req.query)
            .sort()
            .map((k) => `${k}=${req.query[k]}`)
            .join('&');
          queryKey = `:qs:${sortedQuery}`;
        }

        cacheKey = `${prefix}${paramsKey}${queryKey}`;
      }

      // Check if data is in Redis cache
      const cachedData = await getCache(cacheKey);

      if (cachedData !== null) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);

        const magenta = '\x1b[35m';
        const cyan = '\x1b[36m';
        const gray = '\x1b[90m';
        const reset = '\x1b[0m';
        console.log(
          `${magenta}[Redis Cache HIT]${reset} ${cyan}${req.method.padEnd(6)}${reset} ${req.originalUrl || req.url} ${gray}(Serving cached response from key: ${cacheKey})${reset}`
        );

        return res.status(200).json(cachedData);
      }

      // Cache Miss: intercept res.json to capture response payload
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // Only cache successful 200/201 responses
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
          // Asynchronously write to Redis (non-blocking)
          setCache(cacheKey, body, ttlSeconds).catch((err) => {
            console.debug(`[Redis] Failed to cache key "${cacheKey}":`, err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.debug('[Redis] Cache middleware error, proceeding with bypass:', err);
      res.setHeader('X-Cache', 'ERROR-BYPASS');
      next();
    }
  };
};
