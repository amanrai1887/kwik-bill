import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    const isSsl =
      process.env.DB_SSL === 'true' ||
      (connectionString && connectionString.includes('supabase.co')) ||
      (process.env.SQL_HOST && process.env.SQL_HOST.includes('supabase.co'));

    const sslConfig = isSsl ? { rejectUnauthorized: false } : undefined;

    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        ssl: sslConfig,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || 'postgres',
        port: parseInt(process.env.SQL_PORT || '5432'),
        user: process.env.SQL_USER || 'postgres',
        password: process.env.SQL_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'invoice_saas',
        ssl: sslConfig,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

