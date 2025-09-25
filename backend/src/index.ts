// AI-GENERATED: minimal Express server bootstrap
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/sessionRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/sessions", sessionRoutes);
app.use("/attendance", attendanceRoutes);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`); // ai-gen marker: server started
});
