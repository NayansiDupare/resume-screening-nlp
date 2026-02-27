const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth = require("../middlewares/auth.middleware");

const {
  uploadResumes,
  getResumesByJobId,
  explainResume,
} = require("../controllers/resume.controller");

router.post(
  "/upload/:jobId",
  auth,
  upload.array("files", 10),
  uploadResumes
);

router.get("/job/:jobId", auth, getResumesByJobId);

router.post("/explain/:resumeId", auth, explainResume);

module.exports = router;
