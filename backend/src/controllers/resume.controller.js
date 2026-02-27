const fs = require("fs");
const pdfParse = require("pdf-parse");

const Job = require("../models/job.model");
const Resume = require("../models/resume.model");
const { getExplanation } = require("../services/nlpClient.service");

/**
 * Upload resumes (PDF)
 */
const uploadResumes = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No resume files uploaded" });
    }

    const savedResumes = [];

    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(buffer);

      const resume = await Resume.create({
        jobId: job._id,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        text: parsed.text || "",
      });

      savedResumes.push(resume);
    }

    return res.status(201).json({
      message: "Resumes uploaded successfully ✅",
      count: savedResumes.length,
      resumes: savedResumes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Resume upload failed",
      error: error.message,
    });
  }
};

/**
 * Get resumes by job
 */
const getResumesByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const resumes = await Resume.find({ jobId }).sort({ createdAt: -1 });

    return res.json({
      jobId,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get resumes failed",
      error: error.message,
    });
  }
};

/**
 * Explain a single resume (FINAL, ALIGNED VERSION)
 */
const explainResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const job = await Job.findById(resume.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 🔥 SINGLE SOURCE OF TRUTH
    const explanation = await getExplanation(
      job.description, // Job Description
      resume.text      // Resume Text
    );

    return res.json({
      resumeId,
      jobId: job._id,
      jobTitle: job.title,
      ...explanation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Resume explanation failed",
      error: error.message,
    });
  }
};

module.exports = {
  uploadResumes,
  getResumesByJobId,
  explainResume,
};
