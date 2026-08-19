import { Router } from "express";
import { getReminderLogs, sendReminder } from "../controllers/reminders.controller.ts";
import { requireAuth } from "../middleware/auth.ts";

const router = Router();

router.use(requireAuth);

router.get("/logs", getReminderLogs);
router.post("/send", sendReminder);

export default router;
