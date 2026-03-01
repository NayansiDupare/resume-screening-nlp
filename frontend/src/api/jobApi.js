import axiosInstance from "./axiosInstance";

// Create Job
export const createJob = (data) => {
  return axiosInstance.post("/job/create", data);
};

// Get All Jobs
export const getAllJobs = () => {
  return axiosInstance.get("/job/all");
};

// Get Single Job (View page)
export const getJobById = (jobId) => {
  return axiosInstance.get(`/job/${jobId}`);
};

// AI Summarize
export const summarizeJD = (description) => {
  return axiosInstance.post("/ai/summarize", { description });
};