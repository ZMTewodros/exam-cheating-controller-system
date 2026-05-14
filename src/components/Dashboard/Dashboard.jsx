import React, { useState, useMemo, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useSignalContext } from "../../context/SignalContext";
import { useAuth } from "../../context/AuthContext";
import SignalCard from "../../components/Dashboard/SignalCard";
import { deleteSignal, deleteAllSignals } from "../../firebase/services";
import { dBmToRisk } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { signals, routers, loading: signalsLoading } = useSignalContext();
  const { profile, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";
  const isApproved = profile?.isApproved === true;

  // ================= STATES =================
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [statusFilter, setStatusFilter] = useState("All Categories");
  const [isScanning, setIsScanning] = useState(false);

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [room, setRoom] = useState("");

  const authorizedSsids = routers ? routers.map((r) => r.ssid) : [];
  const controlRef = doc(db, "control", "scanner");

  // ================= REALTIME SCANNER STATE =================
  useEffect(() => {
    if (!currentUser || !isApproved) return;
    const unsub = onSnapshot(controlRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      setIsScanning(data.status === "start");
      setDepartment(data.department || "");
      setYear(data.year || "");
      setRoom(data.room || "");
    });
    return () => unsub();
  }, [currentUser, isApproved]);

  // ================= SCANNER ACTIONS =================
  async function startScanning() {
    if (!department || !year || !room) {
      alert("Please select Department, Year and Room");
      return;
    }
    await setDoc(controlRef, { status: "start", department, year, room });
  }

  async function stopScanning() {
    await setDoc(controlRef, { status: "stop", department, year, room });
  }

  async function handleDeleteAll() {
    if (!isAdmin) return;
    const ok = window.confirm("Delete ALL scanned signals?");
    if (!ok) return;
    await deleteAllSignals(signals);
  }

  // Transient Loading View
  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-slate-400 font-medium animate-pulse">Loading workspace session...</div>
      </div>
    );
  }

  // ================= UNAUTHENTICATED PUBLIC LANDING VIEW =================
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-slate-50 rounded-3xl p-8 text-center border border-gray-100 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-xl space-y-6">
          <div className="bg-blue-50 text-blue-600 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border border-blue-200">
            Exam Guard Security Environment
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Radio Frequency Environmental Monitoring
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Authorized proctors and administrative accounts can log in to initialize sweeps, process device identification whitelists, and review real-time security telemetry.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-blue-600/20 text-md tracking-wide"
            >
              Sign In to Dashboard Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= UNAPPROVED GATEKEEPER ROUTE =================
  if (currentUser && profile && profile.isApproved === false) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-3xl max-w-md shadow-sm">
        <h2 className="text-2xl font-black text-yellow-800 mb-3">
          Account Pending Approval
        </h2>
        <p className="text-yellow-700 font-medium">
          Your account registration is successful. Please wait for an administrator to confirm and activate your access privileges.
        </p>
      </div>
    </div>
  );
}

  // ================= FILTERING LOGIC =================
  const filteredSignals = useMemo(() => {
    if (!signals) return [];
    return signals.filter((signal) => {
      const risk = dBmToRisk(signal.rssi);
      const authorized = authorizedSsids.includes(signal.ssid);

      const matchesSearch =
        signal.ssid?.toLowerCase().includes(search.toLowerCase()) ||
        signal.mac?.toLowerCase().includes(search.toLowerCase());

      const matchesRisk = riskFilter === "All Risk Levels" || risk === riskFilter;
      const matchesStatus =
        statusFilter === "All Categories" ||
        (statusFilter === "Authorized" && authorized) ||
        (statusFilter === "Unauthorized" && !authorized);

      const matchesContext =
        (!department || signal.department === department) &&
        (!year || signal.year === year) &&
        (!room || signal.room === room);

      return matchesSearch && matchesRisk && matchesStatus && matchesContext;
    });
  }, [signals, search, riskFilter, statusFilter, department, year, room, authorizedSsids]);

  const totalDevices = filteredSignals.length;
  const authorizedCount = filteredSignals.filter((s) => authorizedSsids.includes(s.ssid)).length;
  const unauthorizedCount = totalDevices - authorizedCount;

  return (
    <div className="space-y-6">
      {/* ================= CONTEXT DROPDOWNS ================= */}
      <div className="grid md:grid-cols-3 gap-4">
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border p-3 rounded-xl bg-white shadow-sm outline-none">
          <option value="">Select Department</option>
          <option value="ECE">ECE</option>
          <option value="CS">CS</option>
          <option value="Management">Management</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)} className="border p-3 rounded-xl bg-white shadow-sm outline-none">
          <option value="">Select Year</option>
          <option value="Year 1">Year 1</option>
          <option value="Year 2">Year 2</option>
          <option value="Year 3">Year 3</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
        </select>

        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Room Number"
          className="border p-3 rounded-xl bg-white shadow-sm outline-none"
        />
      </div>

      {/* ================= SCANNER ACTION CONTROLS ================= */}
      <div className="flex flex-wrap gap-4 items-center">
        <button onClick={startScanning} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">
          Start Scanning
        </button>
        <button onClick={stopScanning} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-sm">
          Stop Scanning
        </button>
        
        {/* Only Admin can see Delete All Scanned button */}
        {isAdmin && (
          <button onClick={handleDeleteAll} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-sm ml-auto">
            Delete All Scanned
          </button>
        )}
      </div>

      {/* ================= LIVE SCANNING STATUS INDICATOR ================= */}
      <div>
        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${isScanning ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
          {isScanning ? "Scanning System: Active" : "Scanning System: Off"}
        </span>
      </div>

      {/* ================= DATA SEARCH FILTERS ================= */}
      <div className="grid md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <input
          type="text"
          placeholder="Search SSID or MAC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-xl outline-none focus:border-blue-500"
        />

        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="border p-3 rounded-xl bg-white outline-none">
          <option>All Risk Levels</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-3 rounded-xl bg-white outline-none">
          <option>All Categories</option>
          <option>Authorized</option>
          <option>Unauthorized</option>
        </select>
      </div>

      {/* ================= STAT SUMMARY BOARD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Devices</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{totalDevices}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-green-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Authorized</p>
          <p className="text-3xl font-black text-green-600 mt-1">{authorizedCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-red-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unauthorized</p>
          <p className="text-3xl font-black text-red-600 mt-1">{unauthorizedCount}</p>
        </div>
      </div>

      {/* ================= SIGNALS RESULTS ================= */}
      {signalsLoading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Loading network logs...</div>
      ) : filteredSignals.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-xl text-gray-400 font-medium">No target signal profiles found matching query filter parameters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              isAdmin={isAdmin}
              isAuthorized={authorizedSsids.includes(signal.ssid)}
              onDelete={deleteSignal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;