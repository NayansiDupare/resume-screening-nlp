import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import Dashboard from "../pages/dashboard/Dashboard";
import Jobs from "../pages/Jobs";
import CreateJob from "../pages/CreateJob";
import JobDetails from "../pages/JobDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/create" element={<CreateJob />} />
      <Route path="/jobs/:jobId" element={<JobDetails />} />

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}