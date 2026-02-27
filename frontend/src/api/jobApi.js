import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create Job
export const createJob = (data) => {
  return API.post("/job/create", data);
};

// Get All Jobs
export const getAllJobs = () => {
  return API.get("/job/all");
};

export const summarizeJD = (description) => {
  return API.post("/ai/summarize", { description });
};