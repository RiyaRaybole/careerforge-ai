import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const { data } = await api.get("/jobs/recommendations");
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load recommendations.");
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Recommendations</h1>
      <p className="text-slate-500 mb-8">
        Based on the skills extracted from your resume.
      </p>

      {error && <p className="text-red-600">{error}</p>}

      {recommendations && (
        <div className="space-y-4">
          {recommendations.map((job) => (
            <div key={job.title} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
                <span className="text-sm font-bold text-indigo-600">{job.matchPercent}% match</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2"
                  style={{ width: `${job.matchPercent}%` }}
                />
              </div>

              {job.matchedSkills.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">You have: </span>
                  <span className="text-sm text-green-700">{job.matchedSkills.join(", ")}</span>
                </div>
              )}
              {job.missingSkills.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Missing: </span>
                  <span className="text-sm text-red-600">{job.missingSkills.join(", ")}</span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Recommended courses</p>
                <ul className="text-sm text-slate-600 list-disc list-inside">
                  {job.recommendedCourses.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
