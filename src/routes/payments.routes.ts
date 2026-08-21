import { Router } from "express";
import { getPayments, postPayment } from "../controllers/payments.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";
import { validateBody } from "../middleware/validate.ts";
import { recordPaymentSchema } from "../lib/validators/index.ts";

const router = Router();

router.use(requireAuth);

router.get("/", cacheResponse("payments", 180), getPayments);
router.post("/", validateBody(recordPaymentSchema), postPayment);

export default router;
