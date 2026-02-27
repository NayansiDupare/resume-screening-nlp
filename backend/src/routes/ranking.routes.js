const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const {
  generateRanking,
  getRankingByJobId,
  updateRankingStatus,
} = require("../controllers/ranking.controller");

router.post("/generate/:jobId", auth, generateRanking);
router.get("/:jobId", auth, getRankingByJobId);

// ✅ NEW ROUTE
router.post("/update-status", auth, updateRankingStatus);

module.exports = router;
