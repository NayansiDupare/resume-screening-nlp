import axiosInstance from "./axiosInstance";

export const generateRanking = (jobId) => {
  return axiosInstance.post(`/ranking/generate/${jobId}`);
};

export const getRanking = (jobId) => {
  return axiosInstance.get(`/ranking/${jobId}`);
};