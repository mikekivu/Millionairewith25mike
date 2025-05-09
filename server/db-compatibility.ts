import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Helper function to ensure array compatibility between PostgreSQL and MySQL
export function ensureArray(value: unknown): string[] {
  if (!value) return [];
  
  // If it's already an array, return it
  if (Array.isArray(value)) return value;
  
  // If it's a string, try to parse it as JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If parsing fails, return an empty array
      console.error('Failed to parse features JSON string:', e);
      return [];
    }
  }
  
  // For any other type, return an empty array
  return [];
}

// When migrating to MySQL, you can replace the db.ts file with this one
// and use the ensureArray function wherever you need to work with array data

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });