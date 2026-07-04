import express from "express";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @route  POST /api/prediction/predict
// Calls the Python ML service with the user's profile + resume skill count,
// then saves the result on the User document.
router.post("/predict", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profile.cgpa == null) {
      return res.status(400).json({
        message: "Fill in your academic profile (at least CGPA) before predicting.",
      });
    }

    const resume = await Resume.findOne({ userId: req.user.id });
    const skillsCount = resume?.skills?.length || 0;

    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cgpa: user.profile.cgpa,
        communication: user.profile.communicationScore ?? 6,
        projects: user.profile.projectsCount,
        internships: user.profile.internshipsCount,
        certifications: user.profile.certificationsCount,
        skills_count: skillsCount,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ML service error: ${errText}`);
    }

    const result = await response.json();

    user.placement = {
      probability: result.placementProbability,
      confidence: result.confidence,
      predictedAt: new Date(),
    };
    await user.save();

    res.json({ message: "Prediction complete", placement: user.placement });
  } catch (err) {
    res.status(500).json({
      message: "Prediction failed. Is the ML service running?",
      error: err.message,
    });
  }
});

export default router;
