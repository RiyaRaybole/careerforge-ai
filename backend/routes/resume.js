import express from "express";
import fs from "fs";
import path from "path";
import { extractText, getDocumentProxy } from "unpdf";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { sendResumeUploadedEmail } from "../services/emailService.js";

const router = express.Router();

// Deletes the physical file for a resume doc, ignoring errors if it's already gone
const deleteResumeFile = (resume) => {
  if (!resume?.fileName) return;
  const filePath = path.join(process.cwd(), "uploads", resume.fileName);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete resume file:", err.message);
    }
  });
};

// @route  POST /api/resume/upload
// Uploads a new resume. If the user already has one, the old file + doc are
// replaced (since a user has at most one active resume — see Resume schema).
router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const extractedText = text.trim();

    if (!extractedText) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        message: "Couldn't read any text from this PDF. Try a text-based PDF, not a scanned image.",
      });
    }

    // Replace any existing resume for this user
    const existing = await Resume.findOne({ userId: req.user.id });
    if (existing) {
      deleteResumeFile(existing);
      await existing.deleteOne();
    }

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      resumeText: extractedText,
      characterCount: extractedText.length,
    });

    // Fire-and-forget notification — never let email delay the response
    User.findById(req.user.id)
      .select("email name")
      .then((user) => {
        if (user) sendResumeUploadedEmail(user.email, user.name);
      });

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume: {
        id: resume._id,
        fileUrl: resume.fileUrl,
        originalName: resume.originalName,
        uploadedAt: resume.uploadedAt,
        characterCount: extractedText.length,
        textPreview: extractedText.slice(0, 500),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/resume
// Returns the logged-in user's current resume (for preview/view).
router.get("/", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  GET /api/resume/status
// Lightweight check the frontend can call without pulling the full resume text.
router.get("/status", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).select(
      "originalName uploadedAt atsScore missingSkills characterCount"
    );
    if (!resume) {
      return res.json({ hasResume: false });
    }
    res.json({
      hasResume: true,
      originalName: resume.originalName,
      uploadedAt: resume.uploadedAt,
      atsScore: resume.atsScore,
      missingSkills: resume.missingSkills,
      characterCount: resume.characterCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route  DELETE /api/resume
// Deletes the user's current resume (file + database record).
router.delete("/", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "No resume to delete" });
    }
    deleteResumeFile(resume);
    await resume.deleteOne();
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
