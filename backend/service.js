const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

// Test route to call ML service
app.post("/api/ranking/test", async (req, res) => {
  try {
    const { job_text, resume_texts } = req.body;

    const response = await axios.post(`${ML_URL}/ml/similarity`, {
      job_text,
      resume_texts,
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: "ML service call failed",
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
