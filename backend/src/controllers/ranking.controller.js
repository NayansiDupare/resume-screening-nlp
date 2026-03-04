const axios = require("axios");

const Job = require("../models/job.model");
const Resume = require("../models/resume.model");
const Ranking = require("../models/ranking.model");

const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

/* ======================================================
   GENERATE RANKING (STRICT ATS + CONVERSATIONAL AI)
====================================================== */
const generateRanking = async (req, res) => {
  try {
    const { jobId } = req.params;

    /* ---------- Validate Job ---------- */
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    /* ---------- Fetch Resumes ---------- */
    const resumes = await Resume.find({ jobId });
    if (!resumes.length) {
      return res.status(400).json({
        message: "No resumes uploaded for this job",
      });
    }

    /* ---------- Similarity ---------- */
    const resumeTexts = resumes.map((r) => r.text || "");

    const mlResponse = await axios.post(`${ML_URL}/ml/similarity`, {
      job_text: job.description,
      resume_texts: resumeTexts,
    });

    const scores = mlResponse.data.scores;

    if (!scores || !Array.isArray(scores)) {
      return res.status(500).json({
        message: "Invalid response from ML service",
      });
    }

    /* ---------- Extract Skills ---------- */
    const skillsResponse = await axios.post(
      `${ML_URL}/ml/extract-skills`,
      { job_text: job.description }
    );

    const extractedSkills = skillsResponse.data;

    const results = [];

    /* ======================================================
       LOOP THROUGH RESUMES
    ====================================================== */
    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i];
      const similarityScore = scores[i] || 0;

      /* ---------- Explain + STRICT ATS ---------- */
      const explainResponse = await axios.post(
        `${ML_URL}/ml/explain`,
        {
          job_text: job.description,
          resume_text: resume.text || "",
          extracted_skills: extractedSkills,
        }
      );

      const explanation = explainResponse.data;

      /* ---------- Conversational AI ---------- */
      let conversationalText = "";

      try {
        const conversationalResponse = await axios.post(
          `${ML_URL}/ml/conversational-explain`,
          { explanation }
        );

        conversationalText =
          conversationalResponse.data.conversational_explanation || "";
      } catch (err) {
        conversationalText = "AI explanation unavailable.";
      }

      /* ---------- Strict ATS ---------- */
      const atsEvaluation = explanation.ats_evaluation || {};
      const strictVerdict = atsEvaluation.verdict || "Rejected";

      const coverage = explanation.jd_coverage || 0;

      /* ---------- Experience ---------- */
      const experienceDetails = explanation.experience || {};
      const experienceScore = experienceDetails.score || 0;
      const experiencePenalty = experienceDetails.penalty || 0;

      /* ---------- Seniority ---------- */
      const seniorityDetails = explanation.seniority || {};
      const seniorityScore = seniorityDetails.score || 0;
      const seniorityPenalty = seniorityDetails.penalty || 0;

      /* ---------- Resume Quality ---------- */
      let resumeQualityScore = 0;
      let resumeQualityDetails = {};
      let resumeQualityPenalties = {};

      try {
        const resumeQualityResponse = await axios.post(
          `${ML_URL}/ml/resume-quality`,
          { resume_text: resume.text || "" }
        );

        resumeQualityScore =
          resumeQualityResponse.data.resume_positive_score || 0;

        resumeQualityDetails = resumeQualityResponse.data;
        resumeQualityPenalties =
          resumeQualityResponse.data.penalties || {};
      } catch {}

      /* ======================================================
         FINAL SCORING
      ====================================================== */

      const similarityWeighted = similarityScore * 50;
      const coverageWeighted = coverage * 0.5;

      let systemPenalties = {};

      if (coverage < 40) {
        systemPenalties.low_coverage = -25;
      }

      if (similarityScore < 0.1) {
        systemPenalties.low_semantic_similarity = -15;
      }

      const totalSystemPenalty = Object.values(systemPenalties)
        .reduce((acc, val) => acc + val, 0);

      const totalResumePenalty = Object.values(resumeQualityPenalties)
        .reduce((acc, val) => acc + val, 0);

      let finalScore = Math.round(
        similarityWeighted +
          coverageWeighted +
          experienceScore +
          experiencePenalty +
          seniorityScore +
          seniorityPenalty +
          resumeQualityScore +
          totalResumePenalty +
          totalSystemPenalty
      );

      finalScore = Math.max(0, finalScore);

      /* ---------- STRICT ATS OVERRIDE ---------- */
      if (strictVerdict === "Rejected") {
        finalScore = Math.min(finalScore, 40);
      }

      /* ======================================================
         PUSH RESULT
      ====================================================== */
      results.push({
        resumeId: resume._id,

        score: finalScore,
        raw_similarity: similarityScore,

        status: "pending",
        decision: strictVerdict,

        ats_evaluation: atsEvaluation,

        // 🔥 Conversational AI (ChatGPT style)
        ai_conversation: conversationalText,

        experience_details: experienceDetails,

        resume_quality_score: resumeQualityScore,
        resume_quality_details: resumeQualityDetails,

        score_breakdown: {
          semantic_similarity: similarityWeighted,
          keyword_coverage: coverageWeighted,
          resume_quality_positive: resumeQualityScore,
          experience_score: experienceScore,
          experience_penalty: experiencePenalty,
          seniority_score: seniorityScore,
          seniority_penalty: seniorityPenalty,
          penalties: {
            ...resumeQualityPenalties,
            ...systemPenalties,
          },
        },

        explanation: {
          jd_coverage: coverage,
          matched_keywords: explanation.matched_keywords || [],
          missing_keywords: explanation.missing_keywords || [],
          top_matching_lines: explanation.top_matching_lines || [],
          reason: explanation.reason || "",
          experience: experienceDetails,
          seniority: seniorityDetails,
        },
      });
    }

    /* ---------- Sort by Score ---------- */
    results.sort((a, b) => b.score - a.score);

    /* ---------- Save Ranking ---------- */
    await Ranking.deleteMany({ jobId });

    const ranking = await Ranking.create({
      jobId,
      results,
    });

    return res.json({
      message: "Ranking generated successfully ✅",
      ranking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ranking generation failed",
      error: error.message,
    });
  }
};

/* ======================================================
   GET RANKING
====================================================== */
const getRankingByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const ranking = await Ranking.findOne({ jobId })
      .populate("jobId")
      .populate("results.resumeId");

    if (!ranking) {
      return res.status(404).json({
        message: "Ranking not found",
      });
    }

    return res.json(ranking);
  } catch (error) {
    return res.status(500).json({
      message: "Get ranking failed",
      error: error.message,
    });
  }
};

/* ======================================================
   UPDATE STATUS
====================================================== */
const updateRankingStatus = async (req, res) => {
  try {
    const { jobId, resumeId, status } = req.body;

    if (!jobId || !resumeId || !status) {
      return res.status(400).json({
        message: "jobId, resumeId and status are required",
      });
    }

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const ranking = await Ranking.findOne({ jobId });

    if (!ranking) {
      return res.status(404).json({
        message: "Ranking not found",
      });
    }

    const result = ranking.results.find(
      (r) => r.resumeId.toString() === resumeId
    );

    if (!result) {
      return res.status(404).json({
        message: "Resume not found in ranking",
      });
    }

    result.status = status;
    await ranking.save();

    return res.json({
      message: "Status updated successfully ✅",
      resumeId,
      status,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update status failed",
      error: error.message,
    });
  }
};

module.exports = {
  generateRanking,
  getRankingByJobId,
  updateRankingStatus,
};