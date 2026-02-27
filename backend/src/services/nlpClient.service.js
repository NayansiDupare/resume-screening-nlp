const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

/**
 * Get similarity scores for multiple resumes (ranking)
 */
const getSimilarityScores = async (jobText, resumeTexts) => {
  const response = await axios.post(`${ML_URL}/ml/similarity`, {
    job_text: jobText,
    resume_texts: resumeTexts,
  });

  return response.data; // { scores: [...] }
};

/**
 * Get explanation for a single resume (detail view)
 */
const getExplanation = async (jobText, resumeText) => {
  const response = await axios.post(`${ML_URL}/ml/explain`, {
    job_text: jobText,
    resume_text: resumeText,
  });

  return response.data;
};

module.exports = {
  getSimilarityScores,
  getExplanation,
};
