import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SignalProvider } from "./context/SignalContext";

import DashboardPage from "./pages/DashboardPage";
import RoutersPage from "./pages/RoutersPage";
import ReportsPage from "./pages/ReportsPage";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white py-4 px-8 shadow-xl mb-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter uppercase">Exam Guard</h1>
        <div className="flex gap-8 font-medium"> {/* 'gap-8' fixes the compacted links */}
          <Link to="/" className="hover:text-orange-400 transition">Dashboard</Link>
          <Link to="/routers" className="hover:text-orange-400 transition">Whitelist</Link>
          <Link to="/reports" className="hover:text-orange-400 transition">Report</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <SignalProvider>

      <Router>

        <Navbar />

        <div className="container mx-auto max-w-5xl py-8 px-3">

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/routers" element={<RoutersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>

        </div>

      </Router>

    </SignalProvider>
  );
}

export default App;