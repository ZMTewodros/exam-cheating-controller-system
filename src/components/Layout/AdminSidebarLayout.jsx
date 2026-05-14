import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebarLayout({ children }) {

  const { profile, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";
  const isApproved = profile?.isApproved === true;

  async function handleLogout() {

    await logout();

    navigate("/login");
  }

  // NOT LOGGED IN OR NOT APPROVED
  if (!profile || !isApproved) {

    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  return (

    <div className="flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl z-20">

        {/* HEADER */}
        <div className="p-6 border-b border-slate-800">

          <h1 className="text-xl font-black tracking-wider text-blue-400">
            EXAM GUARD
          </h1>

          <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">

            {isAdmin
              ? "Admin Control Panel"
              : "Examiner View"}

          </p>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 mt-4">

          {/* DASHBOARD */}
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm transition ${
              location.pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Dashboard
          </Link>

          {/* ADMIN ONLY */}
          {isAdmin && (
            <>
              {/* WHITELIST */}
              <Link
                to="/whitelist"
                className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm transition ${
                  location.pathname === "/whitelist"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Whitelist
              </Link>

              {/* REPORTS */}
              <Link
                to="/reports"
                className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm transition ${
                  location.pathname === "/reports"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Reports & Logs
              </Link>

              {/* USERS */}
              <Link
                to="/users"
                className={`flex items-center px-4 py-3 rounded-xl font-bold text-sm transition ${
                  location.pathname === "/users"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                User Management
              </Link>
            </>
          )}

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800">

          <div className="px-4 py-2 mb-3 text-xs text-slate-400 truncate font-medium">

            {profile.email}

          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 font-bold text-sm py-2 px-4 rounded-xl transition"
          >
            Sign Out
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 min-h-screen">

        {children}

      </main>

    </div>
  );
}

export default AdminSidebarLayout;