const Job = require("../models/job.model");

// Create Job
const createJob = async (req, res) => {
  try {
    const { title, description, requirements } = req.body;

    if (!title || !description || !requirements?.length) {
      return res.status(400).json({
        message: "Title, description and requirements are required",
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements,
    });

    res.status(201).json({
      message: "Job created successfully ✅",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    return res.json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get jobs failed",
      error: error.message,
    });
  }
};

// Get Job By Id
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });

    return res.json(job);
  } catch (error) {
    return res.status(500).json({
      message: "Get job failed",
      error: error.message,
    });
  }
};

// Update Job
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, requirements } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.title = title ?? job.title;
    job.description = description ?? job.description;
    job.requirements = requirements ?? job.requirements;

    await job.save();

    return res.json({
      message: "Job updated successfully ✅",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update job failed",
      error: error.message,
    });
  }
};

// Delete Job
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // optional but recommended cleanup
    await Promise.all([
      require("../models/resume.model").deleteMany({ jobId }),
      require("../models/ranking.model").deleteMany({ jobId }),
    ]);

    await job.deleteOne();

    return res.json({
      message: "Job deleted successfully 🗑",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Delete job failed",
      error: error.message,
    });
  }
};


module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};

