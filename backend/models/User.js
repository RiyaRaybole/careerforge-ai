import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },

    // Academic profile — manually entered by the student.
    // Used as input features for Phase 5 (ML placement prediction) and
    // shown on the Phase 6 analytics dashboard. Kept separate from the
    // Resume model because these are self-reported, not parsed from a file.
    profile: {
      cgpa: { type: Number, default: null, min: 0, max: 10 },
      projectsCount: { type: Number, default: 0 },
      internshipsCount: { type: Number, default: 0 },
      certificationsCount: { type: Number, default: 0 },
      communicationScore: { type: Number, default: null, min: 0, max: 10 },
    },

    // Set once Phase 5's ML service returns a prediction for this user.
    placement: {
      probability: { type: Number, default: null }, // 0-100
      confidence: { type: Number, default: null }, // 0-100
      predictedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

