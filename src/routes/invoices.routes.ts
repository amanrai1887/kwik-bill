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

const router = Router();

// Public endpoint (protected with rate limiter against DDoS/enumeration)
router.get("/public/:invoiceNumber", publicPayLimiter, getPublicInvoice);

// Authenticated merchant endpoints
router.use(requireAuth);

router.get("/", getInvoices);
router.get("/:id", getInvoice);
router.post("/", postInvoice);
router.put("/:id/status", putInvoiceStatus);
router.delete("/:id", removeInvoice);

export default router;

