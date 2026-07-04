import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../api/axios.js";

const COLORS = ["#4f46e5", "#e2e8f0"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics/me");
        setData(data);
      } catch (err) {
        setError("Could not load analytics.");
      }
    };
    fetchAnalytics();
  }, []);

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!data) return <p className="text-slate-400 text-center mt-10">Loading...</p>;

  const skillGapData = [
    { name: "Matched Skills", value: data.skillGap.matchedCount },
    { name: "Missing Skills", value: data.skillGap.missingCount },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile completion */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Completion</h2>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-2">
            <div
              className="bg-indigo-600 h-4 transition-all"
              style={{ width: `${data.profileCompletionPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">{data.profileCompletionPercent}% complete</p>
          <ul className="mt-4 text-sm space-y-1">
            {Object.entries(data.checklist).map(([key, done]) => (
              <li key={key} className="flex items-center gap-2">
                <span>{done ? "✅" : "⬜"}</span>
                <span className="text-slate-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill gap pie chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Skill Gap</h2>
          {data.skillGap.matchedCount + data.skillGap.missingCount > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={skillGapData} dataKey="value" innerRadius={50} outerRadius={80}>
                  {skillGapData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">Run AI analysis to see your skill gap.</p>
          )}
        </div>

        {/* ATS score */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">ATS Score</h2>
          <div className="text-4xl font-bold text-indigo-600">{data.atsScore ?? "—"}</div>
        </div>

        {/* Placement */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Placement Probability</h2>
          <div className="text-4xl font-bold text-indigo-600">
            {data.placement?.probability != null ? `${data.placement.probability}%` : "—"}
          </div>
        </div>
      </div>

      {data.topSkills?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Top Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.topSkills.map((s) => (
              <span key={s} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
