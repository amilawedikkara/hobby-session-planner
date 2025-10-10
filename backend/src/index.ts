// AI-GENERATED: minimal Express server bootstrap
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/sessionRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import { pool } from "./db";


dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
    credentials: true,
  }
));
app.use(express.json());

app.use("/sessions", sessionRoutes);
app.use("/attendance", attendanceRoutes);

import { Pool } from "pg";

console.log("🚀 Starting backend...");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Test DB connection (reuse shared pool)
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    const result = await client.query("SELECT version()");
    console.log("PostgreSQL version:", result.rows[0].version);
    client.release();
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error("Error message:", error.message || error);
  }
})();

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
