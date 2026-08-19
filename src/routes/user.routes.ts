import { Router } from "express";
import { getUserProfile, putUserProfile, resetUserData } from "../controllers/user.controller.ts";
import { submitPlanRequest } from "../controllers/admin.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();


router.use(requireAuth);

router.get("/profile", getUserProfile);
router.put("/profile", putUserProfile);
router.post("/reset", resetUserData);
router.post("/plan-request", submitPlanRequest);

export default router;


