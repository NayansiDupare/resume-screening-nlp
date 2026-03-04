const mongoose = require("mongoose");

const rankingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    results: [
      {
        resumeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Resume",
          required: true,
        },

        score: {
          type: Number,
          required: true,
        },

        raw_similarity: {
          type: Number,
          default: 0,
        },

        // -----------------------------
        // GitHub
        // -----------------------------
        github_score: {
          type: Number,
          default: 0,
        },
        github_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        // -----------------------------
        // Portfolio
        // -----------------------------
        portfolio_score: {
          type: Number,
          default: 0,
        },
        portfolio_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        // -----------------------------
        // LinkedIn
        // -----------------------------
        linkedin_score: {
          type: Number,
          default: 0,
        },
        linkedin_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        // -----------------------------
        // Status & Decision
        // -----------------------------
        status: {
          type: String,
          default: "pending",
        },

        decision: {
          type: String,
          default: "Rejected",
        },

        // 🔥 STRICT ATS BLOCK (NEW)
        ats_evaluation: {
          verdict: {
            type: String,
            default: "",
          },
          reject_reasons: {
            type: [String],
            default: [],
          },
          narrative: {
            type: String,
            default: "",
          },
        },

        // -----------------------------
        // Resume Quality
        // -----------------------------
        resume_quality_score: {
          type: Number,
          default: 0,
        },
        resume_quality_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        // -----------------------------
        // Score Breakdown
        // -----------------------------
        score_breakdown: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        // -----------------------------
        // Explanation
        // -----------------------------
        explanation: {
          jd_coverage: {
            type: Number,
            default: 0,
          },
          matched_keywords: {
            type: [String],
            default: [],
          },
          missing_keywords: {
            type: [String],
            default: [],
          },
          top_matching_lines: {
            type: [String],
            default: [],
          },
          reason: {
            type: String,
            default: "",
          },
        },

        ai_conversation: {
          type: String,
          default: ""
        },

        // -----------------------------
        // Experience Details
        // -----------------------------
        experience_details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ranking", rankingSchema);