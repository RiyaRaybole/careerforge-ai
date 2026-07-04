import express from "express";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @route  GET /api/analytics/me
// Returns chart-ready data for the logged-in student's dashboard:
// profile completion %, skill gap breakdown, and placement/ATS snapshot.
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const resume = await Resume.findOne({ userId: req.user.id });

    // Profile completion — used for a simple progress ring/bar on the dashboard
    const checklist = {
      hasResume: Boolean(resume),
      hasAnalysis: Boolean(resume?.atsScore != null),
      hasAcademicProfile: user.profile?.cgpa != null,
      hasPrediction: user.placement?.probability != null,
    };
    const completedSteps = Object.values(checklist).filter(Boolean).length;
    const profileCompletionPercent = Math.round((completedSteps / 4) * 100);

    // Skill gap: matched vs missing skills, ready for a pie/donut chart
    const skillGap = resume
      ? {
          matchedCount: resume.skills?.length || 0,
          missingCount: resume.missingSkills?.length || 0,
        }
      : { matchedCount: 0, missingCount: 0 };

    res.json({
      checklist,
      profileCompletionPercent,
      atsScore: resume?.atsScore ?? null,
      skillGap,
      placement: user.placement,
      topSkills: resume?.skills?.slice(0, 10) || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
