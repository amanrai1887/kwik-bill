import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { updateUserProfile } from "../db/users.ts";
import { db } from "../db/index.ts";
import { clients, invoices, payments, reminderLogs, recurringProfiles } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { isSuperAdminEmail } from "../config/app.config.ts";
import { asyncHandler, ApiResponse } from "../utils/apiResponse.ts";

export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.dbUser;
  return ApiResponse.success(res, { user });
});

export const putUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const userRole = req.dbUser?.role;
  const userEmail = req.dbUser?.email;
  const userPlan = req.dbUser?.subscriptionPlan;
  const isPro = userRole === 'superadmin' || isSuperAdminEmail(userEmail) || userPlan === 'pro_499';

  const payload = { ...req.body };

  // Enforce 2-template limit for free and starter users (only 'modern' and 'classic')
  if (!isPro && payload.invoiceTemplate) {
    const allowedTemplates = ['modern', 'classic'];
    if (!allowedTemplates.includes(payload.invoiceTemplate)) {
      payload.invoiceTemplate = 'modern';
    }
  }

  const updated = await updateUserProfile(userId, payload);
  return ApiResponse.success(res, { user: updated });
});

// Reset workspace data to 100% fresh/clean state (0 clients, 0 invoices, 0 payments, 0 reminder logs, 0 recurring profiles)
export const resetUserData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;

  await db.transaction(async (tx) => {
    // Delete in sequence respecting foreign keys
    await tx.delete(reminderLogs).where(eq(reminderLogs.userId, userId));
    await tx.delete(payments).where(eq(payments.userId, userId));
    await tx.delete(recurringProfiles).where(eq(recurringProfiles.userId, userId));
    await tx.delete(invoices).where(eq(invoices.userId, userId));
    await tx.delete(clients).where(eq(clients.userId, userId));
  });

  return ApiResponse.success(res, { message: "Workspace successfully reset to a clean slate." });
});
