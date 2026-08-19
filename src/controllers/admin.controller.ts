import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { getAllTenants, updateTenantSubscription } from "../db/users.ts";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";

export async function getTenants(req: AuthRequest, res: Response) {
  try {
    const tenants = await getAllTenants();
    res.json({ success: true, tenants });
  } catch (error: any) {
    console.error("Failed to fetch tenants:", error);
    res.status(500).json({ error: error.message || "Failed to fetch tenants" });
  }
}

export async function postTenant(req: AuthRequest, res: Response) {
  try {
    const { email, businessName, phone, industryType, subscriptionPlan, upiId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Company email is required." });
    }

    const generatedUid = `manual-onboard-${Date.now()}`;

    const created = await db.insert(users).values({
      uid: generatedUid,
      email,
      businessName: businessName || 'New Business Client',
      phone: phone || '',
      upiId: upiId || '',
      industryType: industryType || 'transport',
      subscriptionPlan: subscriptionPlan || 'pro_499',
      subscriptionStatus: 'active',
      role: 'subscriber',
    }).returning();

    res.json({ success: true, tenant: created[0] });
  } catch (error: any) {
    console.error("Failed to onboard tenant:", error);
    res.status(500).json({ error: error.message || "Failed to onboard tenant" });
  }
}

export async function putTenantSubscription(req: AuthRequest, res: Response) {
  try {
    const tenantId = parseInt(req.params.id);
    const { plan, status } = req.body;
    const updated = await updateTenantSubscription(tenantId, plan, status);
    res.json({ success: true, tenant: updated });
  } catch (error: any) {
    console.error("Failed to update tenant subscription:", error);
    res.status(500).json({ error: error.message || "Failed to update subscription" });
  }
}

export async function submitPlanRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const { businessName, contactPerson, email, phone, industryType, requestedPlan, businessNeeds } = req.body;

    const { createPlanRequest } = await import("../db/planRequests.ts");
    const created = await createPlanRequest(userId, {
      businessName,
      contactPerson,
      email: email || req.dbUser.email,
      phone,
      industryType: industryType || 'general',
      requestedPlan,
      businessNeeds,
    });

    res.json({ success: true, request: created });
  } catch (error: any) {
    console.error("Failed to submit plan request:", error);
    res.status(500).json({ error: error.message || "Failed to submit plan request" });
  }
}

export async function getPlanRequestsList(req: AuthRequest, res: Response) {
  try {
    const { getAllPlanRequests } = await import("../db/planRequests.ts");
    const requests = await getAllPlanRequests();
    res.json({ success: true, requests });
  } catch (error: any) {
    console.error("Failed to fetch plan requests:", error);
    res.status(500).json({ error: error.message || "Failed to fetch plan requests" });
  }
}

export async function putPlanRequestStatus(req: AuthRequest, res: Response) {
  try {
    const requestId = parseInt(req.params.id);
    const { status, approveAsSubscriber, userId, requestedPlan } = req.body;
    const { updatePlanRequestStatus } = await import("../db/planRequests.ts");
    const updated = await updatePlanRequestStatus(requestId, status);

    // If approving, also activate the user's subscription
    if (approveAsSubscriber && userId && requestedPlan) {
      await updateTenantSubscription(userId, requestedPlan, 'active');
    }

    res.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("Failed to update plan request status:", error);
    res.status(500).json({ error: error.message || "Failed to update plan request status" });
  }
}

