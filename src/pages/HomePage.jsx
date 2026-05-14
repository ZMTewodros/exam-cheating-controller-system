import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Minimalist Navigation Bar */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <span className="font-black text-xl tracking-wider text-slate-100">EXAM GUARD</span>
        </div>
        <Link 
          to="/login" 
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2 rounded-xl text-sm font-bold transition duration-200"
        >
          Log In
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-4xl mx-auto px-6 text-center my-auto space-y-8 py-12">
        
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Secure Academic Integrity with Automated Signal Tracking
        </h1>
        
        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed">
          An advanced hardware-integrated controller platform designed to scan, analyze, and flag unauthorized mobile hotspots and transmission frequencies inside examination halls in real-time.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/login" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition duration-200"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Features Brief Footer Anchor */}
      <footer id="features" className="border-t border-slate-800/60 bg-slate-950/40 py-8 text-center text-xs font-medium text-slate-500">
        <p>© {new Date().getFullYear()} Exam Guard Controller System. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default HomePage;