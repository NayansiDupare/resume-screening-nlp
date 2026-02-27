const Job = require("../models/job.model");
const Resume = require("../models/resume.model");
const Ranking = require("../models/ranking.model");

const getDashboardData = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const resumesUploaded = await Resume.countDocuments();

    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);

    // For table: job-wise resume count + status
    const recentScreening = await Promise.all(
      recentJobs.map(async (job) => {
        const resumeCount = await Resume.countDocuments({ jobId: job._id });
        const ranking = await Ranking.findOne({ jobId: job._id });

        const topScore =
          ranking?.results?.length > 0
            ? Math.max(...ranking.results.map((r) => r.score || 0))
            : null;

        return {
          _id: job._id,
          jobTitle: job.title,
          resumes: resumeCount,
          topScore: topScore !== null ? topScore.toFixed(2) : "-",
          status: ranking ? "Done" : "Pending",
        };
      })
    );

    return res.json({
      totalJobs,
      resumesUploaded,
      shortlisted: 0, // (we can update later when you add shortlist feature)
      rejected: 0,    // (we can update later)
      recentScreening,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Dashboard API failed",
      error: error.message,
    });
  }
};

module.exports = { getDashboardData };
