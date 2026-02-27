import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function JobDetails() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch Job
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/job/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setJob(res.data);
      } catch {
        toast.error("Failed to fetch job");
      }
    };

    fetchJob();
    fetchRanking();
  }, [jobId]);

  // Fetch Ranking
  const fetchRanking = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/ranking/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRanking(res.data || []);
    } catch {
      console.log("No ranking yet");
    }
  };

  // Upload Resumes
  const handleUpload = async () => {
    if (!files.length) {
      return toast.error("Please select resumes");
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    setLoading(true);

    try {
      await axios.post(
        `http://localhost:5000/api/resume/upload/${jobId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Resumes uploaded successfully");
      setFiles([]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Generate Ranking
  const handleGenerateRanking = async () => {
    setRankingLoading(true);

    try {
      await axios.post(
        `http://localhost:5000/api/ranking/generate/${jobId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Ranking generated");
      fetchRanking();
    } catch {
      toast.error("Failed to generate ranking");
    } finally {
      setRankingLoading(false);
    }
  };

  // Update Candidate Status
  const handleStatusUpdate = async (resumeId, status) => {
    try {
      await axios.post(
        `http://localhost:5000/api/ranking/update-status`,
        { jobId, resumeId, status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Candidate ${status}`);
      fetchRanking();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Job Info */}
      <div className="bg-white p-8 rounded-xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
        <p className="mb-4">{job.description}</p>
        <p className="text-sm text-slate-600">
          Requirements: {job.requirements?.join(", ")}
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow mb-8">
        <h3 className="text-xl font-semibold mb-6">Upload Resumes</h3>

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="mb-6"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Ranking Section */}
      <div className="bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Ranking</h3>

          <button
            onClick={handleGenerateRanking}
            disabled={rankingLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            {rankingLoading ? "Generating..." : "Generate Ranking"}
          </button>
        </div>

        {ranking.length === 0 ? (
          <p className="text-slate-500">No ranking generated yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">Score</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((candidate) => (
                <tr key={candidate._id} className="border-b">
                  <td className="p-4">{candidate.name}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${candidate.score}%` }}
                        ></div>
                      </div>
                      <span>{candidate.score}%</span>
                    </div>
                  </td>

                  <td className="p-4 capitalize">
                    {candidate.status || "pending"}
                  </td>

                  <td className="p-4 space-x-3">
                    <button
                      onClick={() =>
                        handleStatusUpdate(candidate._id, "shortlisted")
                      }
                      className="text-green-600 hover:underline"
                    >
                      Shortlist
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(candidate._id, "rejected")
                      }
                      className="text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}