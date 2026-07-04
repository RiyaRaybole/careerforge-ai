import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight">
        CareerForge <span className="text-indigo-400">AI</span>
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-400 transition">
              Dashboard
            </Link>
            <span className="text-sm text-slate-300">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-400 transition">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md text-sm transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
