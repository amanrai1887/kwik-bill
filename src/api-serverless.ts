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

let isDbInitialized = false;

// Ensure database tables are initialized once on serverless cold-start
app.use(async (req, res, next) => {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.error("[Vercel API] DB init error:", err);
    }
  }
  next();
});

// Mount router on both /api and root / so all rewrites resolve properly
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
