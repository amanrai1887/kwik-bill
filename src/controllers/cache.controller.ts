import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { 
  invalidateUserCache, 
  flushAllCache, 
  getCacheStats 
} from '../lib/redis.ts';
import { asyncHandler, ApiResponse } from '../utils/apiResponse.ts';

/**
 * Reset all cached data for the authenticated merchant/user
 * POST /api/user/cache/reset
 */
export const resetUserCache = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser?.id;
  if (userId) {
    await invalidateUserCache(userId);
  }
  return ApiResponse.success(res, {
    message: 'Cache successfully cleared for your workspace.',
    userId,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Superadmin global cache flush
 * POST /api/admin/cache/flush
 */
export const flushGlobalCache = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const flushed = await flushAllCache();
  return ApiResponse.success(res, {
    message: flushed ? 'All system cache keys flushed successfully.' : 'Redis cache is offline or could not be flushed.',
    flushed,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Superadmin get Redis cache performance & health metrics
 * GET /api/admin/cache/stats
 */
export const getCacheHealthStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getCacheStats();
  return ApiResponse.success(res, { stats });
});
