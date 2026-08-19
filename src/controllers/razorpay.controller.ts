import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { AuthRequest } from "../middleware/auth.ts";
import { updateTenantSubscription } from "../db/users.ts";

function getRazorpayInstance() {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured in environment variables (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET).");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 * Body: { amount: number (in paise), currency?: string, receipt?: string, planId?: string, notes?: Record<string, any> }
 */
export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { amount, currency = "INR", receipt, planId, notes = {} } = req.body;

    // Validate amount (must be >= 100 paise = 1 INR)
    if (!amount || typeof amount !== "number" || amount < 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount. Minimum amount is 100 paise (₹1.00).",
      });
    }

    const razorpay = getRazorpayInstance();
    const generatedReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const orderOptions = {
      amount: Math.round(amount), // ensure integer paise
      currency: currency.toUpperCase(),
      receipt: generatedReceipt,
      notes: {
        ...notes,
        planId: planId || "standard_plan",
        userId: req.dbUser?.id ? String(req.dbUser.id) : "guest",
        email: req.user?.email || "",
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("[Razorpay createOrder error]:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.error?.description || error.message || "Failed to create Razorpay order",
    });
  }
}

/**
 * STEP 3: BACKEND - Verify Signature
 * POST /api/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId? }
 */
export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Check for required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment verification fields (order_id, payment_id, signature).",
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay secret key is not configured on the server.",
      });
    }

    // HMAC-SHA256 signature verification
    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(bodyToSign)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      console.warn(`[Razorpay Signature Mismatch] Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        error: "Payment verification failed. Signature mismatch.",
      });
    }

    // If user is authenticated and planId is passed, upgrade the user's subscription
    let updatedUser = null;
    if (req.dbUser?.id && planId) {
      try {
        updatedUser = await updateTenantSubscription(req.dbUser.id, planId, "active");
        console.log(`[Subscription Upgraded] User ${req.dbUser.id} upgraded to ${planId}`);
      } catch (dbErr) {
        console.error("[Subscription DB Update Error]:", dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      planId: planId || null,
      user: updatedUser || null,
    });
  } catch (error: any) {
    console.error("[Razorpay verifyPayment error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error during payment verification",
    });
  }
}
