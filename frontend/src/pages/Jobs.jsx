import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllJobs } from "../api/jobApi";

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getAllJobs();
        console.log(res.data); // check backend structure

        // If backend returns array directly
        setJobs(Array.isArray(res.data) ? res.data : res.data.jobs);
      } catch (err) {
        console.error("Failed to fetch jobs");
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Jobs</h2>

        <button
          onClick={() => navigate("/jobs/create")}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
        >
          + Create Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Requirements</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobs?.map((job) => (
              <tr key={job._id} className="border-b hover:bg-slate-50">
                <td className="p-4">{job.title}</td>
                <td className="p-4">{job.description}</td>
                <td className="p-4">
                  {job.requirements?.join(", ")}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs?.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            No jobs found.
          </div>
        )}
      </div>
    </div>
  );
}