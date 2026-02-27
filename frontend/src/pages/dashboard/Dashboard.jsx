import Navbar from "../../components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Dashboard Overview
        </h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Jobs</h3>
            <p className="text-3xl mt-2 text-indigo-600">12</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Resumes</h3>
            <p className="text-3xl mt-2 text-indigo-600">87</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Shortlisted</h3>
            <p className="text-3xl mt-2 text-indigo-600">25</p>
          </div>
        </div>
      </div>
    </div>
  );
}