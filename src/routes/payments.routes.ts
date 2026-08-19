import { Router } from "express";
import { getPayments, postPayment } from "../controllers/payments.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();

router.use(requireAuth);

router.get("/", getPayments);
router.post("/", postPayment);

export default router;
