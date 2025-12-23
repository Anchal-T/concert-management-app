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

// Optimized connection pool for local MySQL
const pool = globalForDb.pool ?? mysql.createPool({
  uri: connectionString,
  // Connection pool settings for better performance
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Keep connections alive to reduce overhead
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Connection timeout settings
  connectTimeout: 10000,
  // Idle timeout - close connections after 30 seconds of inactivity
  idleTimeout: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: 'default' });
