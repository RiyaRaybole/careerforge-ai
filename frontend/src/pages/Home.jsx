import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        Land your dream job with{" "}
        <span className="text-indigo-600">CareerForge AI</span>
      </h1>
      <p className="text-slate-600 max-w-xl mb-8">
        Upload your resume, get an instant ATS score, discover missing skills,
        and let AI guide your path to placement.
      </p>
      <div className="flex gap-4">
        <Link
          to="/signup"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="border border-slate-300 hover:border-indigo-600 px-6 py-3 rounded-lg font-medium transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
