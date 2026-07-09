# CareerForge AI 🚀
### AI-Powered Career Intelligence Platform

A full-stack platform where a student can upload their resume, get AI-driven
ATS scoring and feedback, receive an ML-predicted placement probability,
see job recommendations, and practice AI-generated interview questions —
plus an admin dashboard for platform-wide insights.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, Multer |
| AI | Google Gemini API (resume analysis, interview questions) |
| ML | Python, scikit-learn, FastAPI (placement prediction) |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend), Render (backend + ML service), MongoDB Atlas |

## Project structure

```
careerforge-ai/
├── backend/            Node + Express API
│   ├── models/         User, Resume, InterviewSession
│   ├── routes/         auth, user, resume, analysis, prediction,
│   │                   analytics, jobs, interview, admin
│   ├── services/       geminiService, emailService
│   ├── middleware/      auth (JWT), adminOnly, upload (multer)
│   └── data/           jobRoles.js (rule-based job matching)
├── frontend/           React + Vite + Tailwind
│   └── src/
│       ├── pages/       Home, Login, Signup, Dashboard, Analytics,
│       │                JobRecommendations, InterviewPrep, AdminDashboard
│       └── components/  Navbar, ResumeUpload, AcademicProfile,
│                        AnalysisPanel, PredictionPanel, route guards
└── ml-service/         Python FastAPI placement-prediction service
    ├── train_model.py  trains + saves the model
    └── app.py          serves POST /predict
```

---

## Feature map — what each phase built

| Phase | Feature | Backend | Frontend |
|---|---|---|---|
| 1 | Frontend foundation | — | React/Vite/Tailwind setup, routing |
| 2 | Auth | `routes/auth.js`, JWT, bcrypt | Login, Signup |
| 3 | Resume upload | `routes/resume.js`, `models/Resume.js`, Multer + `unpdf` text extraction | `ResumeUpload.jsx` (upload, replace, delete, progress bar) |
| 4 | AI resume analysis | `routes/analysis.js`, `services/geminiService.js` (Gemini) | `AnalysisPanel.jsx` (ATS score, keywords, recommendations) |
| 5 | ML placement prediction | `routes/prediction.js` calls `ml-service` | `PredictionPanel.jsx`, `AcademicProfile.jsx` |
| 6 | Analytics dashboard | `routes/analytics.js` (aggregation) | `Analytics.jsx` (Recharts pie chart, completion bar) |
| 7 | Job recommendations | `routes/jobs.js`, `data/jobRoles.js` (rule-based matching) | `JobRecommendations.jsx` |
| 8 | AI interview prep | `routes/interview.js`, `models/InterviewSession.js` | `InterviewPrep.jsx` |
| 9 | Notifications & email | `services/emailService.js`, hooked into signup + resume upload | — (backend only) |
| 10 | Admin dashboard | `routes/admin.js`, `middleware/adminOnly.js` | `AdminDashboard.jsx` |
| 11 | Deployment | — | — (see below) |

---

## Prerequisites

1. **Node.js** (v18+): https://nodejs.org
2. **Python** (3.10+): https://python.org — needed for the ML service
3. **VS Code**: https://code.visualstudio.com
4. **MongoDB Atlas account** (free): https://www.mongodb.com/cloud/atlas/register
5. **Gemini API key** (free): https://aistudio.google.com/apikey — powers Phase 4 & 8
6. **Git + GitHub account**

---

## Local setup

### 1. MongoDB
Follow the earlier steps you already completed to get a `MONGO_URI` connection string.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key       # Phase 4 & 8
ML_SERVICE_URL=http://localhost:8000  # Phase 5
SMTP_HOST=smtp.gmail.com              # Phase 9 (optional — see note below)
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```
Then:
```bash
npm run dev
```

> **Email is optional.** If `SMTP_USER`/`SMTP_PASS` are left blank, the app
> still works fully — it just logs "email skipped" to the console instead of
> sending. Signup and resume upload never fail because of email.

> **Gmail SMTP note:** you can't use your regular Gmail password. Go to your
> Google Account → Security → 2-Step Verification → App Passwords, generate
> one, and use that as `SMTP_PASS`.

### 3. ML service (Phase 5)
```bash
cd ml-service
python3 -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
The model (`model.pkl`, `scaler.pkl`) is already trained and included. To
retrain with different logic, edit `train_model.py` and run `python train_model.py`.

Visit `http://localhost:8000` — you should see `{"status": "ok", ...}`.

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Visit `http://localhost:5173`.

### 5. Try it end to end
1. Sign up → you're logged into the Dashboard.
2. Upload a PDF resume.
3. Click **Analyze Resume** (needs `GEMINI_API_KEY`).
4. Fill in your Academic Profile, click **Predict** (needs the ML service running).
5. Visit **Job Recommendations** and **Interview Prep** from the Dashboard.

### Making yourself an admin (Phase 10)
There's no signup toggle for this by design (so random users can't self-promote).
In MongoDB Atlas → Browse Collections → `users` → find your user → edit the
`role` field from `"student"` to `"admin"` → log out and back in. You'll now
see an **Admin Dashboard** link on your Dashboard.

---

## Deployment (Phase 11)

You're deploying **three services**: frontend (Vercel), backend (Render),
and the ML service (Render) — plus MongoDB Atlas, which you already have.

### A. Push to GitHub
```bash
cd careerforge-ai
git init
git add .
git commit -m "Full build: phases 1-11"
git remote add origin https://github.com/<your-username>/careerforge-ai.git
git branch -M main
git push -u origin main
```

### B. Deploy the ML service on Render (do this first)
1. https://render.com → **New +** → **Web Service** → select your repo.
2. **Root Directory**: `ml-service`
3. **Runtime**: Python 3
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. **Instance Type**: Free
7. Deploy. Copy the URL, e.g. `https://careerforge-ml.onrender.com`.

### C. Deploy the backend on Render
1. **New +** → **Web Service** → same repo.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Environment variables:

   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | long random string |
   | `CLIENT_URL` | `*` for now (fix in step E) |
   | `GEMINI_API_KEY` | your Gemini key |
   | `ML_SERVICE_URL` | the Render URL from step B |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | optional |

6. Deploy. Copy the URL, e.g. `https://careerforge-backend.onrender.com`.

### D. Deploy the frontend on Vercel
1. https://vercel.com → **Add New** → **Project** → your repo.
2. **Root Directory**: `frontend`
3. Environment variable: `VITE_API_URL` = `https://careerforge-backend.onrender.com/api`
4. Deploy. Copy the URL, e.g. `https://careerforge-ai.vercel.app`.

### E. Connect them (fix CORS)
Render → backend service → Environment → set `CLIENT_URL` to your real Vercel
URL → Save (auto-redeploys).

### F. Test it live
Open your Vercel URL, sign up, upload a resume, run analysis and prediction.

> **Free tier notes:**
> - Render free services sleep after inactivity — first request after a
>   while takes ~30-50s to wake up. This applies to both the backend and the
>   ML service.
> - Render's free disk storage is **ephemeral** — uploaded resume PDFs are
>   lost on redeploy/restart. Fine for a demo; for production you'd swap to
>   Cloudinary, S3, or MongoDB GridFS.
> - Gemini's free tier has rate limits — fine for demoing, not for heavy traffic.

---

## Bonus features you could add next
Dark mode, real-time notifications, an AI career chatbot, an interview
scheduler, resume version history, exporting the AI report as a PDF — all
listed as optional in the original roadmap. The current architecture
(separate Resume/User/InterviewSession models, a services/ folder for
external APIs) is built so each of these slots in without a rewrite.

---


---


