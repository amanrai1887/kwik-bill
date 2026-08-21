import { Router } from "express";
import { getPayments, postPayment } from "../controllers/payments.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

router.use(requireAuth);

router.get("/", cacheResponse("payments", 180), getPayments);
router.post("/", postPayment);

export default router;
