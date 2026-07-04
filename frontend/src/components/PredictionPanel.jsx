import { useState } from "react";
import api from "../api/axios.js";

export default function PredictionPanel({ placement }) {
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(placement);

  const handlePredict = async () => {
    setPredicting(true);
    setError("");
    try {
      const { data } = await api.post("/prediction/predict");
      setResult(data.placement);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-slate-900">Placement Prediction</h2>
        <button
          onClick={handlePredict}
          disabled={predicting}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50"
        >
          {predicting ? "Predicting..." : "Predict"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Powered by a logistic regression model trained on academic + resume signals.
      </p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {result?.probability != null ? (
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold text-indigo-600">{result.probability}%</div>
            <div className="text-xs text-slate-500">Placement Chance</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-700">{result.confidence}%</div>
            <div className="text-xs text-slate-500">Model Confidence</div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Fill in your academic profile, then click Predict.
        </p>
      )}
    </div>
  );
}
