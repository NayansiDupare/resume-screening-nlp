const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/job.controller");

const auth = require("../middlewares/auth.middleware");

router.post("/create", createJob);
router.get("/all", getAllJobs);
router.get("/:jobId", getJobById);

router.put("/update/:jobId", auth, updateJob);
router.delete("/delete/:jobId", auth, deleteJob);

module.exports = router;
