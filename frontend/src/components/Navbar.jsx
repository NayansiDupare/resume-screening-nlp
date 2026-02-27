import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const linkClass =
    "text-slate-700 hover:text-indigo-600 transition font-medium";

  const activeClass = "text-indigo-600";

  return (
    <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      
      {/* Logo */}
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-bold text-indigo-600 cursor-pointer"
      >
        Resume AI
      </h1>

      <div className="flex gap-8 items-center">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Jobs
        </NavLink>

        {/* Remove ranking/resumes for now since not built */}
        
        <button
          onClick={handleLogout}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}