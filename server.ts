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

  // Security: Enable proxy trust for reverse proxies (Nginx/Cloudflare/AWS ALB)
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Global Middleware
  app.use(express.json());

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // HTTP Request Logger Middleware with Method, Endpoint, Status Code, & Response Time
  app.use((req, res, next) => {
    // Only log API routes and ignore Vite HMR / internal asset noise
    if (req.url.startsWith("/api") || req.url.startsWith("/pay")) {
      const startTime = Date.now();
      const timestamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
      const method = req.method.padEnd(6);

      res.on("finish", () => {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        const cacheHeader = res.getHeader("X-Cache");

        // ANSI color codes
        const cyan = "\x1b[36m";
        const yellow = "\x1b[33m";
        const green = "\x1b[32m";
        const red = "\x1b[31m";
        const magenta = "\x1b[35m";
        const reset = "\x1b[0m";
        const gray = "\x1b[90m";

        const statusColor = status >= 500 ? red : status >= 400 ? yellow : green;
        const timeColor = duration > 500 ? red : duration > 200 ? yellow : gray;
        const cacheBadge = cacheHeader === "HIT" ? ` ${magenta}[CACHED]${reset}` : "";

        console.log(
          `${gray}[${timestamp}]${reset} ${cyan}${method}${reset} ${req.originalUrl} ${statusColor}${status}${reset} ${timeColor}${duration}ms${reset}${cacheBadge}`
        );
      });
    }
    next();
  });

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

