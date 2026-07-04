import { useState, useEffect } from "react";
import api from "../api/axios.js";

export default function AcademicProfile() {
  const [form, setForm] = useState({
    cgpa: "",
    projectsCount: "",
    internshipsCount: "",
    certificationsCount: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/me");
        setForm({
          cgpa: data.profile?.cgpa ?? "",
          projectsCount: data.profile?.projectsCount ?? "",
          internshipsCount: data.profile?.internshipsCount ?? "",
          certificationsCount: data.profile?.certificationsCount ?? "",
        });
      } catch {
        // non-fatal — form just starts empty
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/user/profile", {
        cgpa: form.cgpa === "" ? undefined : Number(form.cgpa),
        projectsCount: form.projectsCount === "" ? undefined : Number(form.projectsCount),
        internshipsCount: form.internshipsCount === "" ? undefined : Number(form.internshipsCount),
        certificationsCount: form.certificationsCount === "" ? undefined : Number(form.certificationsCount),
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Academic Profile</h2>
      <p className="text-sm text-slate-500 mb-4">
        This feeds the placement prediction model once it's connected (coming soon).
      </p>

      <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CGPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            name="cgpa"
            value={form.cgpa}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Projects</label>
          <input
            type="number"
            min="0"
            name="projectsCount"
            value={form.projectsCount}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Internships</label>
          <input
            type="number"
            min="0"
            name="internshipsCount"
            value={form.internshipsCount}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Certifications</label>
          <input
            type="number"
            min="0"
            name="certificationsCount"
            value={form.certificationsCount}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
