import { Response } from "express";
import { AuthRequest } from "../middleware/auth.ts";
import { recordPayment, getPaymentsForUser } from "../db/payments.ts";

export async function getPayments(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const list = await getPaymentsForUser(userId);
    res.json({ success: true, payments: list });
  } catch (error: any) {
    console.error("Failed to get payments:", error);
    res.status(500).json({ error: error.message || "Failed to get payments" });
  }
}

export async function postPayment(req: AuthRequest, res: Response) {
  try {
    const userId = req.dbUser.id;
    const recorded = await recordPayment(userId, req.body);
    res.json({ success: true, payment: recorded });
  } catch (error: any) {
    console.error("Failed to record payment:", error);
    res.status(500).json({ error: error.message || "Failed to record payment" });
  }
}
