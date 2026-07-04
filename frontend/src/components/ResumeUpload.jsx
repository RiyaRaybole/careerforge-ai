import { useState, useEffect } from "react";
import api from "../api/axios.js";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [resume, setResume] = useState(null); // current resume status from the server
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/resume/status");
      setResume(data.hasResume ? data : null);
    } catch {
      // silently ignore — dashboard still works without this
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileChange = (e) => {
    setError("");
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setProgress(0);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });
      setFile(null);
      await fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your current resume? You can upload a new one anytime.")) return;
    try {
      await api.delete("/resume");
      setResume(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete resume.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Resume</h2>
      <p className="text-sm text-slate-500 mb-4">
        Upload a PDF resume. We'll extract the text so AI features can analyze it later.
      </p>

      {!loadingStatus && resume && (
        <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4 flex items-center justify-between">
          <div className="text-sm text-green-700">
            ✅ <span className="font-medium">{resume.originalName}</span> —{" "}
            {resume.characterCount} characters extracted
          </div>
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )}

      <label className="flex-1 cursor-pointer border border-dashed border-slate-300 rounded-lg px-4 py-6 text-center text-sm text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition block">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? file.name : resume ? "Choose a new PDF to replace it" : "Click to choose a PDF file"}
      </label>

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {uploading && (
        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition disabled:opacity-50"
      >
        {uploading ? `Uploading... ${progress}%` : resume ? "Replace Resume" : "Upload Resume"}
      </button>
    </div>
  );
}
