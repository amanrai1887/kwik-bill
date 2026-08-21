import { Router } from "express";
import { 
  getInvoices, 
  getInvoice, 
  getPublicInvoice,
  postInvoice, 
  putInvoiceStatus, 
  removeInvoice 
} from "../controllers/invoices.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { publicPayLimiter } from "../middleware/rateLimiter.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

// Public endpoint (protected with rate limiter and cached for high load)
router.get("/public/:invoiceNumber", publicPayLimiter, cacheResponse("invoice-public", 300), getPublicInvoice);

// Authenticated merchant endpoints
router.use(requireAuth);

router.get("/", cacheResponse("invoices", 120), getInvoices);
router.get("/:id", cacheResponse("invoice-detail", 120), getInvoice);
router.post("/", postInvoice);
router.put("/:id/status", putInvoiceStatus);
router.delete("/:id", removeInvoice);

export default router;

