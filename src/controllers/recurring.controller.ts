import { Response } from 'express';
import { 
  getRecurringProfilesByUserId, 
  createRecurringProfileInDb, 
  toggleRecurringProfileInDb, 
  deleteRecurringProfileFromDb 
} from '../db/recurring.ts';
import { processRecurringInvoices } from '../services/recurring.service.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { isSuperAdminEmail } from '../config/app.config.ts';
import { asyncHandler, ApiResponse, BadRequestError, ForbiddenError, NotFoundError, parsePositiveInt } from '../utils/apiResponse.ts';
import { invalidateUserCache } from '../lib/redis.ts';

// GET /api/recurring
export const getRecurringProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const profiles = await getRecurringProfilesByUserId(userId);
  return ApiResponse.success(res, { profiles });
});

// POST /api/recurring
export const createRecurringProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;

  // STRICT PRO PLAN CHECK: Only Pro users (or superadmin) can create recurring billing profiles
  const userRole = req.dbUser?.role;
  const userEmail = req.dbUser?.email;
  const userPlan = req.dbUser?.subscriptionPlan;
  const isProUser = userRole === 'superadmin' || isSuperAdminEmail(userEmail) || userPlan === 'pro_499';

  if (!isProUser) {
    throw new ForbiddenError(
      'Automated recurring billing is exclusively available on the Pro Growth Plan (₹499/mo). Please upgrade to Pro to create recurring schedules.'
    );
  }

  const { clientId, startDate, items, totalAmount } = req.body;
  if (!clientId || !startDate || !items || !totalAmount) {
    throw new BadRequestError('Missing required recurring fields: clientId, startDate, items, and totalAmount are mandatory.');
  }

  const created = await createRecurringProfileInDb(userId, req.body);
  await invalidateUserCache(userId, 'recurring', 'invoices', 'analytics');
  return ApiResponse.success(res, { profile: created }, 201, 'Recurring profile created successfully');
});

// PUT /api/recurring/:id/toggle
export const toggleRecurringProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, 'recurring profile ID');

  const updated = await toggleRecurringProfileInDb(userId, id);
  if (!updated) {
    throw new NotFoundError('Recurring profile not found.');
  }

  await invalidateUserCache(userId, 'recurring');
  return ApiResponse.success(res, { profile: updated }, 200, 'Recurring profile status toggled');
});

// DELETE /api/recurring/:id
export const deleteRecurringProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const id = parsePositiveInt(req.params.id, 'recurring profile ID');

  const deleted = await deleteRecurringProfileFromDb(userId, id);
  if (!deleted) {
    throw new NotFoundError('Recurring profile not found.');
  }

  await invalidateUserCache(userId, 'recurring');
  return ApiResponse.success(res, { message: 'Recurring profile deleted successfully' });
});

// POST /api/recurring/trigger-run
export const triggerManualRun = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await processRecurringInvoices();
  const userId = req.dbUser?.id;
  if (userId) {
    await invalidateUserCache(userId, 'recurring', 'invoices', 'analytics');
  }
  return ApiResponse.success(res, { result });
});
