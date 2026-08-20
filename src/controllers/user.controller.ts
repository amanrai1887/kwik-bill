import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { updateUserProfile } from "../db/users.ts";
import { db } from "../db/index.ts";
import { clients, invoices, payments, reminderLogs } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const user = req.dbUser;
    res.json({ success: true, user });
  } catch (error: any) {
    console.error("Failed to load profile:", error);
    res.status(500).json({ error: error.message || "Failed to load profile" });
  }
}

export async function putUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const userRole = req.dbUser?.role;
    const userEmail = req.dbUser?.email?.toLowerCase();
    const userPlan = req.dbUser?.subscriptionPlan;
    const isPro = userRole === 'superadmin' || userEmail === 'arai.343531@gmail.com' || userPlan === 'pro_499';

    const payload = { ...req.body };

    // Enforce 2-template limit for free and starter users (only 'modern' and 'classic')
    if (!isPro && payload.invoiceTemplate) {
      const allowedTemplates = ['modern', 'classic'];
      if (!allowedTemplates.includes(payload.invoiceTemplate)) {
        payload.invoiceTemplate = 'modern';
      }
    }

    const updated = await updateUserProfile(userId, payload);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
}

// Reset workspace data to 100% fresh/clean state (0 clients, 0 invoices, 0 payments, 0 reminder logs)
export async function resetUserData(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    
    // Delete in sequence respecting foreign keys
    await db.delete(reminderLogs).where(eq(reminderLogs.userId, userId));
    await db.delete(payments).where(eq(payments.userId, userId));
    await db.delete(invoices).where(eq(invoices.userId, userId));
    await db.delete(clients).where(eq(clients.userId, userId));

    res.json({ success: true, message: "Workspace successfully reset to a clean slate." });
  } catch (error: any) {
    console.error("Failed to reset user data:", error);
    res.status(500).json({ error: error.message || "Failed to reset workspace" });
  }
}
