import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getJobById } from "../api/jobApi";
import { uploadResumes, deleteResume, explainResume } from "../api/resumeApi";
import { generateRanking, getRanking } from "../api/rankingApi";

export default function JobDetails() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchJob();
    fetchRanking();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await getJobById(jobId);
      setJob(res.data);
    } catch {
      toast.error("Failed to fetch job");
    }
  };

  const fetchRanking = async () => {
    try {
      const res = await getRanking(jobId);
      setRanking(res.data?.results || []);
    } catch {
      setRanking([]);
    }
  };

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
      await uploadResumes(jobId, formData);
      toast.success("Resumes uploaded successfully");
      setFiles([]);
      fetchRanking();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      toast.success("Resume deleted successfully");
      fetchRanking();
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const handleGenerateRanking = async () => {
    setRankingLoading(true);
    try {
      await generateRanking(jobId);
      toast.success("Ranking generated");
      fetchRanking();
    } catch {
      toast.error("Failed to generate ranking");
    } finally {
      setRankingLoading(false);
    }
  };

  const handleExplain = async (resumeId) => {
    try {
      const res = await explainResume(resumeId);

      setSelectedCandidate({
        score: res.data.jd_coverage,
        decision: res.data.decision,
        matched_keywords: res.data.matched_keywords,
        missing_keywords: res.data.missing_keywords,
        aiExplanation: res.data.conversational_explanation
      });

    } catch {
      toast.error("Failed to generate AI explanation");
    }
  };

  if (!job) return <div className="p-8">Loading...</div>;

  // Find top candidate score
  const topScore = Math.max(...ranking.map((c) => c.score || 0));

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
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-left">Candidate</th>
                  <th className="p-4 text-left">Score</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Explain</th>
                  <th className="p-4 text-left">Delete</th>
                </tr>
              </thead>

              <tbody>
                {ranking.map((candidate) => (
                  <tr
                    key={candidate._id}
                    className={`border-b ${
                      candidate.score === topScore
                        ? "bg-green-50 border-green-300"
                        : ""
                    }`}
                  >

                    <td className="p-4">
                      {candidate.resumeId?.originalName || "Unknown"}

                      {candidate.score === topScore && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                          Top Candidate
                        </span>
                      )}
                    </td>

                    {/* Score with progress bar */}
                    <td className="p-4">
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full"
                          style={{
                            width: `${Math.min(candidate.score, 100)}%`
                          }}
                        ></div>
                      </div>

                      <p className="text-sm mt-1 font-semibold">
                        {Math.min(candidate.score, 100)}%
                      </p>
                    </td>

                    <td className="p-4 capitalize">
                      {candidate.status || "pending"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleExplain(candidate.resumeId?._id)}
                        className="text-indigo-600 hover:underline"
                      >
                        Explain AI
                      </button>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(candidate.resumeId?._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* AI Explanation Panel */}
            {selectedCandidate && (
              <div className="mt-8 p-6 bg-slate-50 rounded-lg">

                <h4 className="text-lg font-bold mb-4">
                  AI Resume Analysis
                </h4>

                <p className="mb-2">
                  <strong>Candidate Score:</strong> {selectedCandidate.score}%
                </p>

                <p className="mb-4">
                  <strong>ATS Decision:</strong> {selectedCandidate.decision}
                </p>

                <div className="mb-4">
                  <strong>Matched Skills:</strong>
                  <ul className="list-disc ml-6">
                    {selectedCandidate.matched_keywords?.map((kw, i) => (
                      <li key={i}>{kw}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <strong>Missing Skills:</strong>
                  <ul className="list-disc ml-6">
                    {selectedCandidate.missing_keywords?.map((kw, i) => (
                      <li key={i}>{kw}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <strong>AI Explanation:</strong>
                  <p className="mt-2 text-slate-700">
                    {selectedCandidate.aiExplanation}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Close
                </button>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}