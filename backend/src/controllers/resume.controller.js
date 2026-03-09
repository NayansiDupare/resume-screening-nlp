const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");

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
      message: "Resumes uploaded successfully",
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
 * Explain a single resume (FULL AI PIPELINE)
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

    // STEP 1: Call ML explain API
    const explanation = await getExplanation(
      job.description,
      resume.text
    );

    // STEP 2: Call conversational AI API
    const aiResponse = await axios.post(
      "http://localhost:5001/ml/conversational-explain",
      {
        explanation
      }
    );

    const conversationalExplanation =
      aiResponse.data.conversational_explanation;

    // STEP 3: Save AI results in database
    resume.score = explanation.jd_coverage;
    resume.matched_keywords = explanation.matched_keywords;
    resume.missing_keywords = explanation.missing_keywords;
    resume.decision = explanation.decision;
    resume.conversational_explanation = conversationalExplanation;

    await resume.save();

    return res.json({
      resumeId,
      jobId: job._id,
      jobTitle: job.title,

      // AI structured result
      ...explanation,

      // AI conversational explanation
      conversational_explanation: conversationalExplanation,
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