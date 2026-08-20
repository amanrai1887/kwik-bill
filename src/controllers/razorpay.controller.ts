import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { AuthRequest } from "../middleware/auth.ts";
import { updateTenantSubscription } from "../db/users.ts";
import { config } from "../config/app.config.ts";
import { asyncHandler, ApiResponse, BadRequestError, ApiError } from "../utils/apiResponse.ts";

function getRazorpayInstance() {
  const keyId = config.razorpay.keyId;
  const keySecret = config.razorpay.keySecret;

  if (!keyId || !keySecret) {
    throw new ApiError("Razorpay credentials are not configured in environment variables (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET).", 500, "CONFIG_ERROR");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 */
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, currency = "INR", receipt, planId, notes = {} } = req.body;

  // Validate amount (must be >= 100 paise = 1 INR)
  if (!amount || typeof amount !== "number" || amount < 100) {
    throw new BadRequestError("Invalid amount. Minimum amount is 100 paise (₹1.00).");
  }

  const razorpay = getRazorpayInstance();
  const generatedReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const orderOptions = {
    amount: Math.round(amount),
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

  return ApiResponse.success(res, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: config.razorpay.keyId,
    receipt: order.receipt,
  });
});

/**
 * STEP 3: BACKEND - Verify Signature
 * POST /api/verify-payment
 */
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new BadRequestError("Missing required payment verification fields (order_id, payment_id, signature).");
  }

  const keySecret = config.razorpay.keySecret;
  if (!keySecret) {
    throw new ApiError("Razorpay secret key is not configured on the server.", 500, "CONFIG_ERROR");
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
    throw new BadRequestError("Payment verification failed. Signature mismatch.");
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

  return ApiResponse.success(res, {
    message: "Payment verified successfully",
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    planId: planId || null,
    user: updatedUser || null,
  });
});
