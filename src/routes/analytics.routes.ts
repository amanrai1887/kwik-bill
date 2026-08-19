import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();

router.use(requireAuth);

router.get("/", getAnalytics);

export default router;
