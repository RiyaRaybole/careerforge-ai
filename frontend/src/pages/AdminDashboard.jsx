import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/stats"),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load admin data.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete user.");
    }
  };

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Students", value: stats.totalUsers },
            { label: "Resumes Uploaded", value: stats.totalResumes },
            { label: "AI-Analyzed", value: stats.analyzedResumes },
            { label: "Predictions Run", value: stats.predictedUsers },
            { label: "Avg ATS Score", value: stats.avgAtsScore ?? "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.topSkills?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Top Skills Across All Students</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((s) => (
              <span key={s.skill} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                {s.skill} ({s.count})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Resume</th>
              <th className="px-4 py-3">ATS Score</th>
              <th className="px-4 py-3">Placement %</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">{u.hasResume ? "✅" : "—"}</td>
                <td className="px-4 py-3">{u.atsScore ?? "—"}</td>
                <td className="px-4 py-3">
                  {u.placement?.probability != null ? `${u.placement.probability}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(u._id, u.name)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
