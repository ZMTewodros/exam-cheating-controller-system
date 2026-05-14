import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SignalProvider } from "./context/SignalContext";
import AdminSidebarLayout from "./components/Layout/AdminSidebarLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import ReportTable from "./components/Report/ReportTable";

// 🔥 Import your new Home Page component
import HomePage from "./pages/HomePage"; 

// Whitelist component layout 
import AddRouter from "./components/Router/AddRouter"; 
import RouterList from "./components/Router/RouterList";

const WhitelistPage = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-black text-slate-900">Authorized Access Whitelist</h2>
      <p className="text-gray-500 mt-1 font-medium">Manage whitelisted access points to prevent authorized institutional signals from triggering alarms.</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1">
        <AddRouter />
      </div>
      <div className="lg:col-span-2">
        <RouterList />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SignalProvider>
          <Routes>
            {/* 🔥 NEW PUBLIC HOME LANDING ROUTE */}
            <Route path="/" element={<HomePage />} />

            {/* PUBLIC AUTH REDIRECTION ROUTE */}
            <Route path="/login" element={<LoginPage />} />

            {/* PROTECTED WORKSPACE APPLICATION ROUTES WINDOW */}
            <Route
              path="/dashboard"
              element={
                <AdminSidebarLayout>
                  <DashboardPage />
                </AdminSidebarLayout>
              }
            />
            <Route
              path="/whitelist"
              element={
                <AdminSidebarLayout>
                  <WhitelistPage />
                </AdminSidebarLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminSidebarLayout>
                  <ReportTable />
                </AdminSidebarLayout>
              }
            />
            <Route
              path="/users"
              element={
                <AdminSidebarLayout>
                  <UserManagementPage />
                </AdminSidebarLayout>
              }
            />

            {/* DEFAULT FALLBACK ROUTE - REDIRECTS TO HOME NOW INSTEAD OF LOGIN */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;