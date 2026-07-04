import express from "express";
import Resume from "../models/Resume.js";
import protect from "../middleware/auth.js";
import jobRoles from "../data/jobRoles.js";

const router = express.Router();

// Case-insensitive overlap between the user's skills and a role's required skills
const scoreMatch = (userSkills, requiredSkills) => {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const matched = requiredSkills.filter((skill) => userSet.has(skill.toLowerCase()));
  const missing = requiredSkills.filter((skill) => !userSet.has(skill.toLowerCase()));
  const matchPercent = Math.round((matched.length / requiredSkills.length) * 100);
  return { matched, missing, matchPercent };
};

// @route  GET /api/jobs/recommendations
// Rule-based job matching: compares the user's extracted resume skills
// (from Phase 4's AI analysis) against a static list of job roles.
router.get("/recommendations", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).select("skills");
    if (!resume || !resume.skills?.length) {
      return res.status(400).json({
        message: "Upload and analyze your resume first (Phase 3 + 4) so we know your skills.",
      });
    }

    const recommendations = jobRoles
      .map((role) => {
        const { matched, missing, matchPercent } = scoreMatch(resume.skills, role.requiredSkills);
        return {
          title: role.title,
          matchPercent,
          matchedSkills: matched,
          missingSkills: missing,
          recommendedCourses: role.courses,
        };
      })
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 5); // top 5 matches

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
