import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { getAllTenants, updateTenantSubscription } from "../db/users.ts";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { createPlanRequest, getAllPlanRequests, updatePlanRequestStatus } from "../db/planRequests.ts";
import { sendAdminPlanRequestNotification } from "../services/email.service.ts";
import { asyncHandler, ApiResponse, BadRequestError, parsePositiveInt } from "../utils/apiResponse.ts";

export const getTenants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenants = await getAllTenants();
  return ApiResponse.success(res, { tenants });
});

export const postTenant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, businessName, phone, industryType, subscriptionPlan, upiId } = req.body;
  if (!email || !email.trim()) {
    throw new BadRequestError("Company email is required.");
  }

  const generatedUid = `manual-onboard-${Date.now()}`;

  const created = await db.insert(users).values({
    uid: generatedUid,
    email: email.trim(),
    businessName: businessName || 'New Business Client',
    phone: phone || '',
    upiId: upiId || '',
    industryType: industryType || 'transport',
    subscriptionPlan: subscriptionPlan || 'pro_499',
    subscriptionStatus: 'active',
    role: 'subscriber',
  }).returning();

  return ApiResponse.success(res, { tenant: created[0] }, 201, "Tenant onboarded successfully");
});

export const putTenantSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = parsePositiveInt(req.params.id, "tenant ID");
  const { plan, status } = req.body;
  if (!plan || !status) {
    throw new BadRequestError("Both plan and status are required.");
  }
  const updated = await updateTenantSubscription(tenantId, plan, status);
  return ApiResponse.success(res, { tenant: updated });
});

export const submitPlanRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const { businessName, contactPerson, email, phone, industryType, requestedPlan, businessNeeds } = req.body;

  if (!businessName || !contactPerson || !phone || !requestedPlan) {
    throw new BadRequestError("Business name, contact person, phone, and requested plan are required.");
  }

  const created = await createPlanRequest(userId, {
    businessName,
    contactPerson,
    email: email || req.dbUser.email,
    phone,
    industryType: industryType || 'general',
    requestedPlan,
    businessNeeds,
  });

  // Dispatch email notification to admin
  sendAdminPlanRequestNotification({
    businessName,
    contactPerson,
    email: email || req.dbUser.email,
    phone,
    industryType: industryType || 'general',
    requestedPlan,
    businessNeeds,
    userId,
  }).catch((err) => console.error('[Admin Notification Error]:', err));

  return ApiResponse.success(res, { request: created }, 201, "Plan request submitted successfully");
});

export const getPlanRequestsList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requests = await getAllPlanRequests();
  return ApiResponse.success(res, { requests });
});

export const putPlanRequestStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requestId = parsePositiveInt(req.params.id, "plan request ID");
  const { status, approveAsSubscriber, userId, requestedPlan } = req.body;

  if (!status) {
    throw new BadRequestError("Status is required.");
  }

  const updated = await updatePlanRequestStatus(requestId, status);

  // If approving, also activate the user's subscription
  if (approveAsSubscriber && userId && requestedPlan) {
    await updateTenantSubscription(Number(userId), requestedPlan, 'active');
  }

  return ApiResponse.success(res, { request: updated });
});
