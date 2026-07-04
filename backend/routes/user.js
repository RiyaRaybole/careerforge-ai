import express from "express";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// @route  GET /api/user/me
// This is a "protected" route — only accessible if a valid JWT is sent.
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  PUT /api/user/profile
// Saves academic profile fields (CGPA, project/internship/certification counts).
// These become the input features for Phase 5's ML placement prediction —
// this endpoint is what gives that phase real data to work with.
router.put("/profile", protect, async (req, res) => {
  try {
    const { cgpa, projectsCount, internshipsCount, certificationsCount, communicationScore } = req.body;

    const update = {};
    if (cgpa !== undefined) update["profile.cgpa"] = cgpa;
    if (projectsCount !== undefined) update["profile.projectsCount"] = projectsCount;
    if (internshipsCount !== undefined) update["profile.internshipsCount"] = internshipsCount;
    if (certificationsCount !== undefined) update["profile.certificationsCount"] = certificationsCount;
    if (communicationScore !== undefined) update["profile.communicationScore"] = communicationScore;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select(
      "-password"
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
