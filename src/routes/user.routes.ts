import { Router } from "express";
import { getUserProfile, putUserProfile, resetUserData } from "../controllers/user.controller.ts";
import { submitPlanRequest } from "../controllers/admin.controller.ts";
import { resetUserCache } from "../controllers/cache.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";
import { validateBody } from "../middleware/validate.ts";
import { updateProfileSchema } from "../lib/validators/index.ts";

const router = Router();

router.use(requireAuth);

router.get("/profile", cacheResponse("profile", 300), getUserProfile);
router.put("/profile", validateBody(updateProfileSchema), putUserProfile);
router.post("/reset", resetUserData);
router.post("/cache/reset", resetUserCache);
router.post("/plan-request", submitPlanRequest);

export default router;


