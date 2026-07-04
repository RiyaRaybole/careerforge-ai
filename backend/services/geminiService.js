// Wraps calls to Google's Gemini API. Requires GEMINI_API_KEY in .env.
// Get a free key at https://aistudio.google.com/apikey

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Calls Gemini with a prompt and returns the raw text response.
// Throws if the API key is missing or the request fails.
export const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no content");
  }
  return text;
};

// Asks Gemini to analyze a resume and return strict JSON.
// We instruct it heavily to avoid markdown/prose so JSON.parse doesn't break.
export const analyzeResumeWithAI = async (resumeText) => {
  const prompt = `You are an ATS (Applicant Tracking System) resume analyzer.
Analyze the following resume text and respond with ONLY valid JSON (no markdown
fences, no explanation) in exactly this shape:

{
  "atsScore": <number 0-100>,
  "missingSkills": [<string>, ...up to 6],
  "strongKeywords": [<string>, ...up to 8],
  "careerRecommendations": [<string>, ...up to 4 short suggestions],
  "resumeSummary": "<2-3 sentence summary of the candidate>",
  "skills": [<string>, ...all technical/professional skills found],
  "education": [<string>, ...degrees/institutions found],
  "projects": [<string>, ...project names/titles found]
}

Resume text:
"""
${resumeText.slice(0, 8000)}
"""`;

  const raw = await callGemini(prompt);

  // Gemini sometimes wraps JSON in ```json fences despite instructions — strip them.
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Could not parse AI response as JSON: " + err.message);
  }
};

// Generates a mix of HR, technical, and coding interview questions
// tailored to the candidate's resume text.
export const generateInterviewQuestions = async (resumeText) => {
  const prompt = `You are a technical interviewer. Based on the resume below,
generate interview questions. Respond with ONLY valid JSON (no markdown fences),
in exactly this shape:

{
  "questions": [
    { "category": "hr", "question": "<string>" },
    { "category": "hr", "question": "<string>" },
    { "category": "technical", "question": "<string>" },
    { "category": "technical", "question": "<string>" },
    { "category": "technical", "question": "<string>" },
    { "category": "coding", "question": "<string>" }
  ]
}

Make the technical and coding questions specific to the skills/technologies
actually mentioned in the resume, not generic. Keep each question under 30 words.

Resume text:
"""
${resumeText.slice(0, 6000)}
"""`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned).questions;
  } catch (err) {
    throw new Error("Could not parse AI response as JSON: " + err.message);
  }
};

// Gives feedback + a communication score (0-10) on a candidate's answer.
export const giveAnswerFeedback = async (question, answer) => {
  const prompt = `You are an interview coach. A candidate was asked:
"${question}"

They answered:
"${answer}"

Respond with ONLY valid JSON (no markdown fences), in exactly this shape:
{
  "feedback": "<2-3 sentences of constructive feedback>",
  "communicationScore": <number 0-10>
}`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Could not parse AI response as JSON: " + err.message);
  }
};
