import { useState } from "react";
import api from "../api/axios.js";

export default function InterviewPrep() {
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [starting, setStarting] = useState(false);
  const [submittingIndex, setSubmittingIndex] = useState(null);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const { data } = await api.post("/interview/start");
      setSession(data);
      setAnswers({});
    } catch (err) {
      setError(err.response?.data?.message || "Could not start interview. Upload a resume first.");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (index) => {
    const answer = answers[index];
    if (!answer?.trim()) return;
    setSubmittingIndex(index);
    try {
      const { data } = await api.post(`/interview/${session._id}/answer/${index}`, { answer });
      setSession((prev) => {
        const updated = { ...prev };
        updated.questions[index] = data.question;
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not get feedback.");
    } finally {
      setSubmittingIndex(null);
    }
  };

  const categoryLabel = { hr: "HR", technical: "Technical", coding: "Coding" };
  const categoryColor = {
    hr: "bg-blue-50 text-blue-700",
    technical: "bg-purple-50 text-purple-700",
    coding: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-slate-900">AI Interview Prep</h1>
        <button
          onClick={handleStart}
          disabled={starting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium transition disabled:opacity-50"
        >
          {starting ? "Generating..." : session ? "New Session" : "Start Practice"}
        </button>
      </div>
      <p className="text-slate-500 mb-8">
        Questions generated from your resume. Answer each one to get AI feedback.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {session && (
        <div className="space-y-5">
          {session.questions.map((q, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor[q.category]}`}>
                {categoryLabel[q.category]}
              </span>
              <p className="font-medium text-slate-900 mt-3 mb-3">{q.question}</p>

              <textarea
                value={q.answer || answers[i] || ""}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                disabled={Boolean(q.feedback)}
                rows={3}
                placeholder="Type your answer..."
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              />

              {!q.feedback && (
                <button
                  onClick={() => handleSubmitAnswer(i)}
                  disabled={submittingIndex === i}
                  className="mt-2 text-sm bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                >
                  {submittingIndex === i ? "Getting feedback..." : "Submit Answer"}
                </button>
              )}

              {q.feedback && (
                <div className="mt-3 bg-slate-50 rounded-md p-3 text-sm">
                  <p className="font-medium text-slate-700 mb-1">
                    Communication Score: {q.communicationScore}/10
                  </p>
                  <p className="text-slate-600">{q.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
