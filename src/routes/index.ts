import { Router } from "express";
import userRoutes from "./user.routes.ts";
import clientsRoutes from "./clients.routes.ts";
import invoicesRoutes from "./invoices.routes.ts";
import paymentsRoutes from "./payments.routes.ts";
import remindersRoutes from "./reminders.routes.ts";
import analyticsRoutes from "./analytics.routes.ts";
import adminRoutes from "./admin.routes.ts";
import recurringRoutes from "./recurring.routes.ts";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Invoice & Payment Reminder SaaS", 
    timestamp: new Date().toISOString() 
  });
});

// Mount domain routes
apiRouter.use("/user", userRoutes);
apiRouter.use("/clients", clientsRoutes);
apiRouter.use("/invoices", invoicesRoutes);
apiRouter.use("/payments", paymentsRoutes);
apiRouter.use("/reminders", remindersRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/recurring", recurringRoutes);


export default apiRouter;
