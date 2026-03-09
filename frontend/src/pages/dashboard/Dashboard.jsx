import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getAllJobs } from "../../api/jobApi";

export default function Dashboard() {

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();

      // FIX HERE
      setJobs(res.data.jobs || []);

    } catch {
      console.log("Failed to fetch jobs");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="p-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-8">
          AI Resume Screening Dashboard
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-slate-500">Total Jobs</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {jobs.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-slate-500">Total Resumes</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              --
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-slate-500">AI Shortlisted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              --
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-slate-500">Top Candidate Score</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              --
            </p>
          </div>

        </div>

        {/* Recent Jobs Table */}
        <div className="bg-white rounded-xl shadow p-8">

          <h3 className="text-xl font-semibold mb-6">
            Recent Jobs
          </h3>

          {jobs.length === 0 ? (
            <p className="text-slate-500">No jobs created yet.</p>
          ) : (
            <table className="w-full">

              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-left">Job Title</th>
                  <th className="p-4 text-left">Requirements</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(jobs) &&
                  jobs.slice(0, 5).map((job) => (
                    <tr key={job._id} className="border-b">

                      <td className="p-4 font-medium">
                        {job.title}
                      </td>

                      <td className="p-4 text-slate-600">
                        {job.requirements?.join(", ")}
                      </td>

                    </tr>
                  ))}
              </tbody>

            </table>
          )}

        </div>

      </div>

    </div>
  );
}