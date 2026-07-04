import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import multer from "multer";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import resumeRoutes from "./routes/resume.js";
import analysisRoutes from "./routes/analysis.js";
import predictionRoutes from "./routes/prediction.js";
import analyticsRoutes from "./routes/analytics.js";
import jobsRoutes from "./routes/jobs.js";
import interviewRoutes from "./routes/interview.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json()); // allows us to read JSON from request bodies

// Serve uploaded resume PDFs statically (e.g. /uploads/<filename>.pdf)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes); // Phase 2
app.use("/api/user", userRoutes); // Phase 2 + 5 (profile)
app.use("/api/resume", resumeRoutes); // Phase 3
app.use("/api/analysis", analysisRoutes); // Phase 4
app.use("/api/prediction", predictionRoutes); // Phase 5
app.use("/api/analytics", analyticsRoutes); // Phase 6
app.use("/api/jobs", jobsRoutes); // Phase 7
app.use("/api/interview", interviewRoutes); // Phase 8
app.use("/api/admin", adminRoutes); // Phase 10

// Health check route — useful to confirm the server is alive after deployment
app.get("/", (req, res) => {
  res.send("CareerForge AI backend is running 🚀");
});

// Catch multer errors (wrong file type, too large, etc.) with a clean JSON response
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
