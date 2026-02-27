const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    originalName: String,
    fileName: String,
    filePath: String,
    text: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
