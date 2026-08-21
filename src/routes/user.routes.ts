import { Router } from "express";
import { getUserProfile, putUserProfile, resetUserData } from "../controllers/user.controller.ts";
import { submitPlanRequest } from "../controllers/admin.controller.ts";
import { resetUserCache } from "../controllers/cache.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

router.use(requireAuth);

router.get("/profile", cacheResponse("profile", 300), getUserProfile);
router.put("/profile", putUserProfile);
router.post("/reset", resetUserData);
router.post("/cache/reset", resetUserCache);
router.post("/plan-request", submitPlanRequest);

export default router;


