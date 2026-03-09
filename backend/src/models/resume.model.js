const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Job", 
      required: true 
    },

    originalName: String,
    fileName: String,
    filePath: String,
    text: String,

    // 🔹 AI Analysis Results

    score: Number,

    matched_keywords: {
      type: [String],
      default: []
    },

    missing_keywords: {
      type: [String],
      default: []
    },

    decision: String,

    conversational_explanation: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);