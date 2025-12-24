import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Singleton pattern for database pool
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

// Optimized connection pool for serverless environment
const pool = globalForDb.pool ?? mysql.createPool({
  uri: connectionString,
  // Reduced connection limits for serverless
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 2 : 10,
  queueLimit: 0,
  // Disable keep-alive in serverless to prevent hanging connections
  enableKeepAlive: false,
  // Reduced timeouts for serverless
  connectTimeout: 10000,
  // Shorter idle timeout for serverless
  idleTimeout: 10000,
  // Important: Close connections after query in serverless
  maxIdle: process.env.NODE_ENV === 'production' ? 2 : 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

/**
 * Database instance configured for the application.
 * Uses MySQL connection pool with Drizzle ORM.
 * Optimized for both local development and serverless deployment.
 */
export const db = drizzle(pool, { schema, mode: 'default' });
