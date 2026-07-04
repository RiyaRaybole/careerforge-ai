import express from "express";
import Resume from "../models/Resume.js";
import InterviewSession from "../models/InterviewSession.js";
import protect from "../middleware/auth.js";
import { generateInterviewQuestions, giveAnswerFeedback } from "../services/geminiService.js";

const router = express.Router();

// @route  POST /api/interview/start
// Generates a fresh set of interview questions based on the user's resume
// and creates a new session to track answers.
router.post("/start", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(400).json({ message: "Upload a resume first" });
    }

    const questions = await generateInterviewQuestions(resume.resumeText);

    const session = await InterviewSession.create({
      userId: req.user.id,
      questions: questions.map((q) => ({ category: q.category, question: q.question })),
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Could not generate interview questions", error: err.message });
  }
});

// @route  POST /api/interview/:sessionId/answer/:questionIndex
// Submits an answer to one question and gets AI feedback + a score.
router.post("/:sessionId/answer/:questionIndex", protect, async (req, res) => {
  try {
    const { sessionId, questionIndex } = req.params;
    const { answer } = req.body;

    const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const q = session.questions[questionIndex];
    if (!q) return res.status(400).json({ message: "Invalid question index" });

    const { feedback, communicationScore } = await giveAnswerFeedback(q.question, answer);

    q.answer = answer;
    q.feedback = feedback;
    q.communicationScore = communicationScore;
    await session.save();

    res.json({ question: q });
  } catch (err) {
    res.status(500).json({ message: "Could not get feedback", error: err.message });
  }
});

// @route  GET /api/interview/history
// Lists the user's past interview practice sessions.
router.get("/history", protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
