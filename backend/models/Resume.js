import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one active resume per user — "replace" deletes the old one
    },

    // Phase 3 — file + extracted text
    fileName: { type: String, required: true }, // stored filename on disk
    originalName: { type: String, required: true }, // name the user uploaded
    fileUrl: { type: String, required: true }, // public path, e.g. /uploads/xyz.pdf
    resumeText: { type: String, required: true },
    characterCount: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },

    // Phase 3/4 — structured data parsed or AI-extracted from the resume text.
    // Empty until Phase 4 (AI) fills them in; frontend should treat [] as "not analyzed yet".
    skills: { type: [String], default: [] },
    education: { type: [String], default: [] },
    projects: { type: [String], default: [] },

    // Phase 4 — AI resume analysis (Gemini). Null until that phase runs.
    atsScore: { type: Number, default: null }, // 0-100
    missingSkills: { type: [String], default: [] },
    strongKeywords: { type: [String], default: [] },
    careerRecommendations: { type: [String], default: [] },
    resumeSummary: { type: String, default: "" },
    lastAnalyzedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
