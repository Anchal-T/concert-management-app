import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Helper to ensure we don't create multiple connections in dev
const globalForDb = globalThis as unknown as { // The globalForDb variable is declared but never used. The code doesn't implement the singleton pattern it appears to be setting up for, which could lead to creating multiple database connections in development mode. TODO
  conn: mysql.Connection | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connection = await mysql.createConnection(connectionString); //Top-level await in a module can cause issues in Next.js. The connection is created at module load time, which may lead to connection exhaustion or initialization problems. Consider wrapping this in a function or using a singleton pattern with lazy initialization. TODO

export const db = drizzle(connection, { schema, mode: 'default' });
