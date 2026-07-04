import mongoose from "mongoose";

// Stores one round of AI-generated interview questions and the user's
// answers + feedback, so a student can review past practice sessions.
const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [
      {
        category: { type: String, enum: ["hr", "technical", "coding"], required: true },
        question: { type: String, required: true },
        answer: { type: String, default: "" },
        feedback: { type: String, default: "" },
        communicationScore: { type: Number, default: null }, // 0-10
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
