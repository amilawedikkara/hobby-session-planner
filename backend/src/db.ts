// Database connection for both local and production environments
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

let pool: Pool;

// ✅ Use DATABASE_URL if provided (Render or cloud)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // 💻 Local database connection (no SSL)
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: false, // 👈 disable SSL locally
  });
}

export { pool };

// Query helper
export const query = (text: string, params?: any[]) => pool.query(text, params);
