import axiosInstance from "./axiosInstance";

export const uploadResumes = (jobId, formData) => {
  return axiosInstance.post(
    `/resume/upload/${jobId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const deleteResume = (resumeId) => {
  return axiosInstance.delete(`/resume/delete/${resumeId}`);
};