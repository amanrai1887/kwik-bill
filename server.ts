import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeDatabase } from "./src/db/init.ts";
import apiRouter from "./src/routes/index.ts";
import { processRecurringInvoices } from "./src/services/recurring.service.ts";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  // Initialize Database Schema and Tables
  await initializeDatabase();

  // Run initial recurring invoices pass on server boot
  processRecurringInvoices().catch((err) =>
    console.error("[Auto-Billing Engine] Boot check failed:", err)
  );

  // Set recurring auto-billing cron check every 1 hour (3,600,000 ms)
  setInterval(() => {
    console.log("[Auto-Billing Engine] Running hourly recurring invoices scan...");
    processRecurringInvoices().catch((err) =>
      console.error("[Auto-Billing Engine] Hourly scan failed:", err)
    );
  }, 60 * 60 * 1000);

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Global Middleware
  app.use(express.json());

  // Mount Modular API Routes
  app.use("/api", apiRouter);

  // Frontend Serving (Vite middleware in dev, static files in prod)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  console.log(PORT)
  const portNumber = Number(PORT) || 3000;
  app.listen(portNumber, "0.0.0.0", () => {
    console.log(`Invoice SaaS Backend running on http://0.0.0.0:${portNumber}`);
  });
}

startServer();

