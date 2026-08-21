import { Router } from "express";
import { getReminderLogs, sendReminder } from "../controllers/reminders.controller.ts";
import { requireAuth } from "../middleware/auth.ts";
import { remindersLimiter } from "../middleware/rateLimiter.ts";
import { cacheResponse } from "../middleware/cacheMiddleware.ts";

const router = Router();

router.use(requireAuth);

router.get("/logs", cacheResponse("reminders", 180), getReminderLogs);
router.post("/send", remindersLimiter, sendReminder);

export default router;
