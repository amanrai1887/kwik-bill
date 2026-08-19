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

const router = Router();

// Public endpoint (accessible without token by clients to view/pay)
router.get("/public/:invoiceNumber", getPublicInvoice);

// Authenticated merchant endpoints
router.use(requireAuth);

router.get("/", getInvoices);
router.get("/:id", getInvoice);
router.post("/", postInvoice);
router.put("/:id/status", putInvoiceStatus);
router.delete("/:id", removeInvoice);

export default router;

