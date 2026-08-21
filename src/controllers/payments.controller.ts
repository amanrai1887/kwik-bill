import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { recordPaymentService, getPaymentsService } from "../services/payments.service.ts";
import { asyncHandler, ApiResponse } from "../utils/apiResponse.ts";
import { invalidateUserCache } from "../lib/redis.ts";

export const getPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const list = await getPaymentsService(userId);
  return ApiResponse.success(res, { payments: list });
});

export const postPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const recorded = await recordPaymentService(userId, req.body);
  await invalidateUserCache(userId, 'payments', 'invoices', 'analytics');
  return ApiResponse.success(res, { payment: recorded }, 201, "Payment recorded successfully");
});
