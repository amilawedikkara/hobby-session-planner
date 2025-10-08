// AI-GENERATED: minimal Express server bootstrap
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/sessionRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

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

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

