import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import ResumeUpload from "../components/ResumeUpload.jsx";
import AcademicProfile from "../components/AcademicProfile.jsx";
import AnalysisPanel from "../components/AnalysisPanel.jsx";
import PredictionPanel from "../components/PredictionPanel.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/user/me");
        setUserData(data);
      } catch (err) {
        setError("Could not load your dashboard. Try logging in again.");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-slate-500 mb-6">
        Upload your resume, run AI analysis, and predict your placement chances.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/analytics" className="text-sm bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1.5 rounded-md text-slate-700 transition">
          📊 Analytics
        </Link>
        <Link to="/jobs" className="text-sm bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1.5 rounded-md text-slate-700 transition">
          💼 Job Recommendations
        </Link>
        <Link to="/interview" className="text-sm bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1.5 rounded-md text-slate-700 transition">
          🎤 Interview Prep
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="text-sm bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1.5 rounded-md text-slate-700 transition">
            👨‍💼 Admin Dashboard
          </Link>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResumeUpload />
        <AcademicProfile />
        <AnalysisPanel />
        {userData && <PredictionPanel placement={userData.placement} />}
      </div>
    </div>
  );
}
