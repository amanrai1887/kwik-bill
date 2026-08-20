import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.SQL_HOST;
const sqlPort = Number(process.env.SQL_PORT) || 5432;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

if (!sqlHost) {
  throw new Error("SQL_HOST must be set in environment variables.");
}
if (!sqlDbName) {
  throw new Error("SQL_DB_NAME must be set in environment variables.");
}
if (!user) {
  throw new Error("SQL_ADMIN_USER or SQL_USER must be set in environment variables.");
}
if (!password) {
  throw new Error("SQL_ADMIN_PASSWORD or SQL_PASSWORD must be set in environment variables.");
}

const isSsl =
  process.env.DB_SSL === "true" ||
  sqlHost?.includes("supabase") ||
  process.env.DATABASE_URL?.includes("supabase");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: isSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: sqlHost || "localhost",
        port: sqlPort,
        user: user || "postgres",
        password: password || "postgres",
        database: sqlDbName || "postgres",
        ssl: isSsl ? { rejectUnauthorized: false } : false,
      },
  verbose: true,
});
