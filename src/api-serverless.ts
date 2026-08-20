import express from "express";
import apiRouter from "./routes/index.ts";
import { initializeDatabase } from "./db/init.ts";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

// Global CORS & Preflight headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Mount router on both /api and root / so all rewrites resolve properly
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Root fallback / error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Vercel API Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}

