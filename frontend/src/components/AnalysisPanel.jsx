import { useState, useEffect } from "react";
import api from "../api/axios.js";

export default function AnalysisPanel() {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchExisting = async () => {
    try {
      const { data } = await api.get("/analysis");
      setAnalysis(data);
    } catch {
      // no analysis yet — that's fine, button will still show
    }
  };

  useEffect(() => {
    fetchExisting();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const { data } = await api.post("/analysis/analyze");
      setAnalysis(data.resume);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Make sure a resume is uploaded.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-slate-900">AI Resume Analysis</h2>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze Resume"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Powered by Gemini AI.</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-indigo-600">{analysis.atsScore ?? "—"}</div>
            <div className="text-sm text-slate-500">ATS Score / 100</div>
          </div>

          {analysis.resumeSummary && (
            <p className="text-sm text-slate-700 italic">{analysis.resumeSummary}</p>
          )}

          {analysis.strongKeywords?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Strong Keywords</p>
              <div className="flex flex-wrap gap-2">
                {analysis.strongKeywords.map((k) => (
                  <span key={k} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.missingSkills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((k) => (
                  <span key={k} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.careerRecommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Recommendations</p>
              <ul className="text-sm text-slate-700 list-disc list-inside space-y-1">
                {analysis.careerRecommendations.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
