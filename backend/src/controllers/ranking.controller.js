const axios = require("axios");

const Job = require("../models/job.model");
const Resume = require("../models/resume.model");
const Ranking = require("../models/ranking.model");

const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

const githubCache = {};

/* ======================================================
   GENERATE RANKING
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

    const results = [];

    /* ======================================================
       LOOP THROUGH RESUMES
    ====================================================== */
    const skillsResponse = await axios.post(
        `${ML_URL}/ml/extract-skills`,
        { job_text: job.description }
      );
     const extractedSkills = skillsResponse.data;
   
   
   
    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i];
      const similarityScore = scores[i] || 0;

      /* ---------- Explain ---------- */
      const explainResponse = await axios.post(
          `${ML_URL}/ml/explain`,
          {
            job_text: job.description,
            resume_text: resume.text || "",
            extracted_skills: extractedSkills
          }
        );


      const explanation = explainResponse.data;
      const experienceDetails = explanation.experience || {};
      const experienceScore = experienceDetails.score || 0;
      const experiencePenalty = experienceDetails.penalty || 0;

      const seniorityDetails = explanation.seniority || {};
      const seniorityScore = seniorityDetails.score || 0;
      const seniorityPenalty = seniorityDetails.penalty || 0;
            const coverage = explanation.jd_coverage || 0;

      /* ================================
         GITHUB
      ================================= */
      const githubMatch = (resume.text || "").match(
        /(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+/i
      );

      let githubDetails = {};

      if (githubMatch) {
        let githubUrl = githubMatch[0];

        if (!githubUrl.startsWith("http")) {
          githubUrl = "https://" + githubUrl;
        }

        if (githubCache[githubUrl]) {
          githubDetails = githubCache[githubUrl];
        } else {
          try {
            const githubResponse = await axios.post(
              `${ML_URL}/ml/github`,
              { github_url: githubUrl }
            );

            githubDetails = githubResponse.data;
            githubCache[githubUrl] = githubResponse.data;
          } catch {
            githubDetails = {};
          }
        }
      }

      const githubPositive =
        githubDetails.github_positive_score || 0;

      const githubPenalties =
        githubDetails.penalties || {};

      const totalGithubPenalty = Object.values(
        githubPenalties
      ).reduce((acc, val) => acc + val, 0);

      /* ================================
         PORTFOLIO
      ================================= */
      const portfolioMatch = (resume.text || "").match(
        /(https?:\/\/[^\s]+)/g
      );

      let portfolioScore = 0;
      let portfolioDetails = {};

      if (portfolioMatch) {
        const possibleUrls = portfolioMatch.filter(
          (url) =>
            !url.includes("github.com") &&
            !url.includes("linkedin.com")
        );

        if (possibleUrls.length > 0) {
          try {
            const portfolioResponse = await axios.post(
              `${ML_URL}/ml/portfolio`,
              {
                portfolio_url: possibleUrls[0],
                job_text: job.description,
              }
            );

            portfolioScore =
              portfolioResponse.data.portfolio_score || 0;

            portfolioDetails =
              portfolioResponse.data;
          } catch {}
        }
      }

      /* ================================
         LINKEDIN
      ================================= */
      const linkedinMatch = (resume.text || "").match(
        /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i
      );

      let linkedinScore = 0;
      let linkedinDetails = {};

      if (linkedinMatch) {
        let linkedinUrl = linkedinMatch[0];

        if (!linkedinUrl.startsWith("http")) {
          linkedinUrl = "https://" + linkedinUrl;
        }

        try {
          const linkedinResponse = await axios.post(
            `${ML_URL}/ml/linkedin`,
            {
              linkedin_url: linkedinUrl,
              job_text: job.description,
            }
          );

          linkedinScore =
            linkedinResponse.data.linkedin_score || 0;

          linkedinDetails =
            linkedinResponse.data;
        } catch {}
      }



      /* ---------- Resume Quality Detection ---------- */
    let resumeQualityScore = 0;
    let resumeQualityDetails = {};
    let resumeQualityPenalties = {};

    try {
      const resumeQualityResponse = await axios.post(
        `${ML_URL}/ml/resume-quality`,
        {
          resume_text: resume.text || "",
        }
      );

      resumeQualityScore =
        resumeQualityResponse.data.resume_positive_score || 0;

      resumeQualityDetails = resumeQualityResponse.data;

      resumeQualityPenalties =
        resumeQualityResponse.data.penalties || {};
    } catch (err) {
      resumeQualityScore = 0;
    }

    

/* ================================
   SCORING
================================ */

      // ---------------------------
      // BASE WEIGHTS
      // ---------------------------
      const similarityWeighted = similarityScore * 50;
      const coverageWeighted = coverage * 0.5;

      // ---------------------------
      // SYSTEM PENALTIES
      // ---------------------------
      let systemPenalties = {};

      if (coverage < 40) {
        systemPenalties.low_coverage = -25;
      }

      if (similarityScore < 0.1) {
        systemPenalties.low_semantic_similarity = -15;
      }

      const totalSystemPenalty = Object.values(systemPenalties)
        .reduce((acc, val) => acc + val, 0);

      // ---------------------------
      // RESUME QUALITY PENALTIES
      // ---------------------------
      const totalResumePenalty = Object.values(resumeQualityPenalties)
        .reduce((acc, val) => acc + val, 0);

      // ---------------------------
      // FINAL SCORE
      // ---------------------------
      let finalScore = Math.round(
        similarityWeighted +
        coverageWeighted +
        githubPositive +
        portfolioScore +
        linkedinScore +
        experienceScore +
        experiencePenalty +
        seniorityScore +
        seniorityPenalty +
        resumeQualityScore +
        totalGithubPenalty +
        totalResumePenalty +
        totalSystemPenalty
      );

finalScore = Math.max(0, finalScore);

      let decision = "Rejected";

      if (finalScore >= 85) {
        decision = "Highly Suitable";
      } else if (finalScore >= 70) {
        decision = "Suitable";
      } else if (finalScore >= 55) {
        decision = "Needs Review";
      }

      /* ================================
         PUSH RESULT
      ================================= */
            results.push({
          resumeId: resume._id,

          // FINAL SCORE
          score: finalScore,

          // CORE ML
          raw_similarity: similarityScore,

          experience_details: experienceDetails,

          // GITHUB
          github_score: githubPositive,
          github_details: githubDetails,

          // PORTFOLIO
          portfolio_score: portfolioScore || 0,
          portfolio_details: portfolioDetails || {},

          // LINKEDIN
          linkedin_score: linkedinScore || 0,
          linkedin_details: linkedinDetails || {},

          // RESUME QUALITY
          resume_quality_score: resumeQualityScore,
          resume_quality_details: resumeQualityDetails,

          // TRANSPARENT BREAKDOWN
          score_breakdown: {
            semantic_similarity: similarityWeighted,
            keyword_coverage: coverageWeighted,
            github_positive: githubPositive,
            portfolio_score: portfolioScore || 0,
            linkedin_score: linkedinScore || 0,
            resume_quality_positive: resumeQualityScore,
            experience_score: experienceScore,
            experience_penalty: experiencePenalty,       
            seniority_score: seniorityScore,
            seniority_penalty: seniorityPenalty,

            penalties: {
              ...githubPenalties,
              ...resumeQualityPenalties,
              ...systemPenalties
            }
          },

          status: "pending",
          decision,

          explanation: {
            jd_coverage: coverage,
            matched_keywords: explanation.matched_keywords || [],
            missing_keywords: explanation.missing_keywords || [],
            top_matching_lines: explanation.top_matching_lines || [],
            reason: explanation.reason || "",
            experience: experienceDetails,
            seniority: seniorityDetails
          }
        });

    }

    results.sort((a, b) => b.score - a.score);

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
        message:
          "jobId, resumeId and status are required",
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
