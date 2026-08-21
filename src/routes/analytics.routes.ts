import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

router.use(requireAuth);

router.get("/", cacheResponse("analytics", 300), getAnalytics);

export default router;
