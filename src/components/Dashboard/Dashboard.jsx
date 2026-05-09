import React, { useState, useMemo } from "react";

import { useSignalContext } from "../../context/SignalContext";
import SignalCard from "../../components/Dashboard/SignalCard";

import {
  deleteSignal,
  deleteAllSignals
} from "../../firebase/services";

import { dBmToRisk } from "../../utils/helpers";

function DashboardPage() {

  const { signals, routers, loading } = useSignalContext();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [statusFilter, setStatusFilter] = useState("All Categories");
  const [isScanning, setIsScanning] = useState(true);

  // NEW STATES
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [room, setRoom] = useState(""); // ✅ NOW MANUAL INPUT

  const authorizedSsids = routers.map(r => r.ssid);

  // Dynamic departments (optional fallback)
  const departments = [...new Set(routers.map(r => r.department || "General"))];

  // FILTER SIGNALS BASED ON ROOM CONTEXT (IMPORTANT)
  const filteredSignals = useMemo(() => {

    return signals.filter(signal => {

      const risk = dBmToRisk(signal.rssi);
      const authorized = authorizedSsids.includes(signal.ssid);

      const matchesSearch =
        signal.ssid?.toLowerCase().includes(search.toLowerCase()) ||
        signal.mac?.toLowerCase().includes(search.toLowerCase());

      const matchesRisk =
        riskFilter === "All Risk Levels" ||
        risk === riskFilter;

      const matchesStatus =
        statusFilter === "All Categories" ||
        (statusFilter === "Authorized" && authorized) ||
        (statusFilter === "Unauthorized" && !authorized);

      // ✅ ROOM + SESSION FILTER (IMPORTANT PART)
      const matchesContext =
        (!department || signal.department === department) &&
        (!year || signal.year === year) &&
        (!room || signal.room === room);

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus &&
        matchesContext
      );
    });

  }, [
    signals,
    search,
    riskFilter,
    statusFilter,
    authorizedSsids,
    department,
    year,
    room
  ]);

  const totalDevices = filteredSignals.length;

  const authorizedCount = filteredSignals.filter(s =>
    authorizedSsids.includes(s.ssid)
  ).length;

  const unauthorizedCount = totalDevices - authorizedCount;

  async function handleDelete(id) {
    await deleteSignal(id);
  }

  async function handleDeleteAll() {
    if (window.confirm("Delete all signals?")) {
      await deleteAllSignals(signals);
    }
  }

  return (

    <div className="max-w-6xl mx-auto px-4">

      {/* CONTEXT SELECTION */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        {/* Department */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option value="">Select Department</option>
          <option value="ECE">ECE</option>
          <option value="CS">CS</option>
          <option value="Accounting">Accounting</option>
          <option value="Management">Management</option>

          {departments.map((dep, i) => (
            <option key={i} value={dep}>
              {dep}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option value="">Select Year</option>
          <option value="Year 1">Year 1</option>
          <option value="Year 2">Year 2</option>
          <option value="Year 3">Year 3</option>
          <option value="Year 4">Year 4</option>
        </select>

        {/* ROOM (NOW MANUAL INPUT ✔) */}
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Room Number (e.g. 101)"
          className="border p-3 rounded-xl"
        />

      </div>

      {/* TOP BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-6">

        <button
          onClick={() => {
            if (!department || !year || !room) {
              alert("Please select Department, Year and enter Room number!");
              return;
            }
            setIsScanning(true);
          }}
          className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold"
        >
          Start Scanning
        </button>

        <button
          onClick={() => setIsScanning(false)}
          className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold"
        >
          Stop Scanning
        </button>

        <button
          onClick={handleDeleteAll}
          className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold"
        >
          Delete All
        </button>

      </div>

      {/* ACTIVE CONTEXT */}
      {department && year && room && (
        <div className="mb-4 text-sm font-semibold text-gray-600">
          Scanning: {department} / {year} / Room {room}
        </div>
      )}

      {/* FILTERS */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <input
          type="text"
          placeholder="Search SSID or MAC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-xl"
        />

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option>All Risk Levels</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option>All Categories</option>
          <option>Authorized</option>
          <option>Unauthorized</option>
        </select>

      </div>

      {/* STATUS */}
      <div className="mb-6">

        <span className={`px-4 py-2 rounded-full text-sm font-black uppercase ${
          isScanning
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {isScanning ? "Scanning Active" : "Scanning Stopped"}
        </span>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow border-b-4 border-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Total Devices
          </p>
          <p className="text-3xl font-black text-gray-800">
            {totalDevices}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-b-4 border-green-500">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Authorized
          </p>
          <p className="text-3xl font-black text-green-600">
            {authorizedCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-b-4 border-red-500">
          <p className="text-xs font-bold text-gray-400 uppercase">
            Unauthorized
          </p>
          <p className="text-3xl font-black text-red-600">
            {unauthorizedCount}
          </p>
        </div>

      </div>

      {/* SIGNALS */}
      {loading ? (

        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Scanning for signals...</p>
        </div>

      ) : filteredSignals.length === 0 ? (

        <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-xl text-gray-400">No signals detected.</p>
        </div>

      ) : (

        <div className="grid gap-4">

          {filteredSignals.map(signal => (

            <SignalCard
              key={signal.id}
              signal={signal}
              isAuthorized={authorizedSsids.includes(signal.ssid)}
              onDelete={handleDelete}
            />

          ))}

        </div>

      )}

    </div>
  );
}

export default DashboardPage;