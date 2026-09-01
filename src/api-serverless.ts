import express from "express";
import apiRouter from "./routes/index.ts";
import { initializeDatabase } from "./db/init.ts";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Ensure req.socket and req.connection are always defined for Express and rate-limiters in Serverless
app.use((req: any, res: any, next: any) => {
  if (!req.socket) {
    req.socket = {};
  }
  if (!req.socket.remoteAddress) {
    const forwarded = req.headers["x-forwarded-for"];
    req.socket.remoteAddress =
      (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : null) ||
      req.headers["x-real-ip"] ||
      "127.0.0.1";
  }
  if (!req.connection) {
    req.connection = req.socket;
  }
  next();
});

// Global CORS & Preflight headers
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

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

let dbInitPromise: Promise<void> | null = null;
function ensureDatabaseInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch((err) => {
      console.error("[Serverless DB Init Error]:", err);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureDatabaseInitialized();
  } catch (err) {
    console.error("[Handler DB Init Exception]:", err);
  }
  return app(req, res);
}


