import express from "express";
import Resume from "../models/Resume.js";
import protect from "../middleware/auth.js";
import { analyzeResumeWithAI } from "../services/geminiService.js";

const router = express.Router();

// @route  POST /api/analysis/analyze
// Runs AI analysis on the user's current resume and saves the results.
router.post("/analyze", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Upload a resume first" });
    }

    const analysis = await analyzeResumeWithAI(resume.resumeText);

    resume.atsScore = analysis.atsScore ?? resume.atsScore;
    resume.missingSkills = analysis.missingSkills ?? resume.missingSkills;
    resume.strongKeywords = analysis.strongKeywords ?? resume.strongKeywords;
    resume.careerRecommendations = analysis.careerRecommendations ?? resume.careerRecommendations;
    resume.resumeSummary = analysis.resumeSummary ?? resume.resumeSummary;
    resume.skills = analysis.skills ?? resume.skills;
    resume.education = analysis.education ?? resume.education;
    resume.projects = analysis.projects ?? resume.projects;
    resume.lastAnalyzedAt = new Date();

    await resume.save();

    res.json({ message: "Resume analyzed successfully", resume });
  } catch (err) {
     console.error("ANALYSIS ERROR:", err.message)
    res.status(500).json({ message: "AI analysis failed", error: err.message });
  }
});

// @route  GET /api/analysis
// Returns the last saved analysis for the user's resume (no re-analysis).
router.get("/", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).select(
      "atsScore missingSkills strongKeywords careerRecommendations resumeSummary skills education projects lastAnalyzedAt"
    );
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
