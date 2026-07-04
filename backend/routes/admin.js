import express from "express";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import protect from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

// All routes below require a logged-in admin
router.use(protect, adminOnly);

// @route  GET /api/admin/users
// Lists all students with a quick snapshot of their progress.
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("name email profile placement createdAt")
      .sort({ createdAt: -1 });

    // Attach whether each user has a resume uploaded, without pulling full text
    const resumes = await Resume.find({}).select("userId atsScore");
    const resumeMap = new Map(resumes.map((r) => [r.userId.toString(), r]));

    const enriched = users.map((u) => ({
      ...u.toObject(),
      hasResume: resumeMap.has(u._id.toString()),
      atsScore: resumeMap.get(u._id.toString())?.atsScore ?? null,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await Resume.deleteOne({ userId: req.params.id });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/admin/stats
// Platform-wide stats for the admin dashboard.
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalResumes = await Resume.countDocuments();
    const analyzedResumes = await Resume.countDocuments({ atsScore: { $ne: null } });
    const predictedUsers = await User.countDocuments({ "placement.probability": { $ne: null } });

    const avgAtsScoreResult = await Resume.aggregate([
      { $match: { atsScore: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$atsScore" } } },
    ]);
    const avgAtsScore = avgAtsScoreResult[0]?.avg ?? null;

    // Skill frequency across all analyzed resumes — powers the "Top Skills" chart
    const skillCounts = await Resume.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalUsers,
      totalResumes,
      analyzedResumes,
      predictedUsers,
      avgAtsScore: avgAtsScore ? Math.round(avgAtsScore) : null,
      topSkills: skillCounts.map((s) => ({ skill: s._id, count: s.count })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
