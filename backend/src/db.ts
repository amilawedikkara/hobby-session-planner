// Unified PostgreSQL pool using Render DATABASE_URL
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Create a single Pool that works in Render + locally
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Query helper (kept same API for your routes)
export const query = (text: string, params?: any[]) => pool.query(text, params);
