import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { AuthRequest } from "../middleware/auth.ts";
import { updateTenantSubscription } from "../db/users.ts";
import { config, PLAN_PRICING } from "../config/app.config.ts";
import { asyncHandler, ApiResponse, BadRequestError, ApiError } from "../utils/apiResponse.ts";
import { invalidateUserCache, invalidateAdminCache } from "../lib/redis.ts";

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

// Track processed payments in-memory to prevent replay attacks on webhook/verify
const processedPaymentIds = new Set<string>();

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 */
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, currency = "INR", receipt, planId, notes = {} } = req.body;

  let finalAmount: number;

  // STRICT SERVER-SIDE PRICING: If upgrading to a subscription plan, amount MUST come from PLAN_PRICING
  if (planId) {
    const authoritativePlanPrice = PLAN_PRICING[planId];
    if (!authoritativePlanPrice) {
      throw new BadRequestError(`Invalid subscription plan: '${planId}'.`);
    }
    finalAmount = authoritativePlanPrice;
  } else {
    // Custom invoice / one-off payment
    if (!amount || typeof amount !== "number" || amount < 100) {
      throw new BadRequestError("Invalid amount. Minimum amount is 100 paise (₹1.00).");
    }
    finalAmount = Math.round(amount);
  }

  const razorpay = getRazorpayInstance();
  const generatedReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const orderOptions = {
    amount: finalAmount,
    currency: currency.toUpperCase(),
    receipt: generatedReceipt,
    notes: {
      ...notes,
      planId: planId || "custom_payment",
      userId: req.dbUser?.id ? String(req.dbUser.id) : "guest",
      email: req.user?.email || "",
      expectedAmount: String(finalAmount),
    },
  };

  const order = await razorpay.orders.create(orderOptions);

  return ApiResponse.success(res, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: config.razorpay.keyId,
    receipt: order.receipt,
    planId: planId || null,
  });
});

/**
 * STEP 3: BACKEND - Verify Signature & Activate Subscription
 * POST /api/verify-payment
 */
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new BadRequestError("Missing required payment verification fields (order_id, payment_id, signature).");
  }

  // Replay Attack Protection: Ensure payment ID hasn't been verified before
  if (processedPaymentIds.has(razorpay_payment_id)) {
    throw new BadRequestError("This payment has already been verified and processed.");
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

  const razorpay = getRazorpayInstance();
  let verifiedPlanId = planId;

  // Server-side verification of Razorpay Order metadata and amount
  try {
    const fetchedOrder: any = await razorpay.orders.fetch(razorpay_order_id);
    const orderPlanId = fetchedOrder?.notes?.planId;

    if (orderPlanId && orderPlanId !== "custom_payment") {
      const requiredPrice = PLAN_PRICING[orderPlanId];
      if (requiredPrice && fetchedOrder.amount < requiredPrice) {
        throw new BadRequestError("Payment amount does not match the price for the requested subscription plan.");
      }
      verifiedPlanId = orderPlanId;
    }
  } catch (fetchErr: any) {
    if (fetchErr instanceof BadRequestError) throw fetchErr;
    console.warn("[Razorpay Order Fetch Warning]:", fetchErr?.message || fetchErr);
  }

  // Mark payment ID as processed
  processedPaymentIds.add(razorpay_payment_id);
  // Keep memory bound (max 5000 ids)
  if (processedPaymentIds.size > 5000) {
    const firstKey = processedPaymentIds.values().next().value;
    if (firstKey) processedPaymentIds.delete(firstKey);
  }

  // If user is authenticated and plan is valid, upgrade the user's subscription
  let updatedUser = null;
  if (req.dbUser?.id && verifiedPlanId && PLAN_PRICING[verifiedPlanId]) {
    try {
      updatedUser = await updateTenantSubscription(req.dbUser.id, verifiedPlanId, "active");
      await Promise.all([
        invalidateUserCache(req.dbUser.id, 'profile'),
        invalidateAdminCache('tenants'),
      ]);
      console.log(`[Subscription Upgraded] User ${req.dbUser.id} securely upgraded to ${verifiedPlanId}`);
    } catch (dbErr) {
      console.error("[Subscription DB Update Error]:", dbErr);
    }
  }

  return ApiResponse.success(res, {
    message: "Payment verified successfully",
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
    planId: verifiedPlanId || null,
    user: updatedUser || null,
  });
});

