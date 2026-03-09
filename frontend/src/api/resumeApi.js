import axiosInstance from "./axiosInstance";

/**
 * Upload resumes
 */
export const uploadResumes = (jobId, formData) => {
  return axiosInstance.post(
    `/resume/upload/${jobId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

/**
 * Delete resume
 */
export const deleteResume = (resumeId) => {
  return axiosInstance.delete(`/resume/delete/${resumeId}`);
};

/**
 * Explain resume using AI pipeline
 */
export const explainResume = (resumeId) => {
  return axiosInstance.post(`/resume/explain/${resumeId}`);
};