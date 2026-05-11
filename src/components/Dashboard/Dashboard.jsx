import React, {
  useState,
  useMemo,
  useEffect
} from "react";

import {
  doc,
  setDoc,
  onSnapshot
} from "firebase/firestore";

import { db } from "../../firebase/config";

import { useSignalContext } from "../../context/SignalContext";

import SignalCard from "../../components/Dashboard/SignalCard";

import {
  deleteSignal,
  deleteAllSignals
} from "../../firebase/services";

import { dBmToRisk } from "../../utils/helpers";

function DashboardPage() {

  const { signals, routers, loading } = useSignalContext();

  // ================= STATES =================

  const [search, setSearch] = useState("");

  const [riskFilter, setRiskFilter] =
    useState("All Risk Levels");

  const [statusFilter, setStatusFilter] =
    useState("All Categories");

  const [isScanning, setIsScanning] =
    useState(false);

  const [department, setDepartment] =
    useState("");

  const [year, setYear] =
    useState("");

  const [room, setRoom] =
    useState("");

  const authorizedSsids =
    routers.map(r => r.ssid);

  const controlRef =
    doc(db, "control", "scanner");

  // =================================================
  // ============= REALTIME CONTROL ==================
  // =================================================

  useEffect(() => {

    const unsub = onSnapshot(controlRef, (docSnap) => {

      if (!docSnap.exists()) return;

      const data = docSnap.data();

      setIsScanning(data.status === "start");

      setDepartment(data.department || "");
      setYear(data.year || "");
      setRoom(data.room || "");

    });

    return () => unsub();

  }, []);

  // =================================================
  // ================= START =========================
  // =================================================

  async function startScanning() {

    if (!department || !year || !room) {

      alert(
        "Please select Department, Year and Room"
      );

      return;
    }

    await setDoc(controlRef, {
      status: "start",
      department,
      year,
      room
    });
  }

  // =================================================
  // ================= STOP ==========================
  // =================================================

  async function stopScanning() {

    await setDoc(controlRef, {
      status: "stop",
      department,
      year,
      room
    });
  }

  // =================================================
  // ================= DELETE ALL ====================
  // =================================================

  async function handleDeleteAll() {

    const ok =
      window.confirm(
        "Delete ALL scanned signals?"
      );

    if (!ok) return;

    await deleteAllSignals(signals);
  }

  // =================================================
  // ================= FILTERING =====================
  // =================================================

  const filteredSignals = useMemo(() => {

    return signals.filter(signal => {

      const risk =
        dBmToRisk(signal.rssi);

      const authorized =
        authorizedSsids.includes(signal.ssid);

      // SEARCH
      const matchesSearch =
        signal.ssid?.toLowerCase()
          .includes(search.toLowerCase()) ||

        signal.mac?.toLowerCase()
          .includes(search.toLowerCase());

      // RISK
      const matchesRisk =
        riskFilter === "All Risk Levels" ||
        risk === riskFilter;

      // STATUS
      const matchesStatus =
        statusFilter === "All Categories" ||

        (statusFilter === "Authorized" &&
          authorized) ||

        (statusFilter === "Unauthorized" &&
          !authorized);

      // CONTEXT
      const matchesContext =

        (!department ||
          signal.department === department)

        &&

        (!year ||
          signal.year === year)

        &&

        (!room ||
          signal.room === room);

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
    department,
    year,
    room,
    authorizedSsids
  ]);

  // =================================================
  // ================= STATS =========================
  // =================================================

  const totalDevices =
    filteredSignals.length;

  const authorizedCount =
    filteredSignals.filter(s =>
      authorizedSsids.includes(s.ssid)
    ).length;

  const unauthorizedCount =
    totalDevices - authorizedCount;

  // =================================================
  // ================= UI ============================
  // =================================================

  return (

    <div className="max-w-6xl mx-auto px-4">

      {/* ================= CONTEXT ================= */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <select
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          className="border p-3 rounded-xl"
        >

          <option value="">
            Select Department
          </option>

          <option value="ECE">
            ECE
          </option>

          <option value="CS">
            CS
          </option>

          <option value="Management">
            Management
          </option>

        </select>

        <select
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
          className="border p-3 rounded-xl"
        >

          <option value="">
            Select Year
          </option>

          <option value="Year 1">
            Year 1
          </option>

          <option value="Year 2">
            Year 2
          </option>

          <option value="Year 3">
            Year 3
          </option>

          <option value="Year 4">
            Year 4
          </option>
          <option value="Year 5">
            Year 5
          </option>

        </select>

        <input
          type="text"
          value={room}
          onChange={(e) =>
            setRoom(e.target.value)
          }
          placeholder="Enter Room Number"
          className="border p-3 rounded-xl"
        />

      </div>

      {/* ================= BUTTONS ================= */}

      <div className="flex flex-wrap gap-4 mb-6">

        <button
          onClick={startScanning}
          className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold"
        >
          Start Scanning
        </button>

        <button
          onClick={stopScanning}
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

      {/* ================= STATUS ================= */}

      <div className="mb-6">

        <span className={`px-4 py-2 rounded-full text-sm font-black uppercase ${
          isScanning
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>

          {isScanning
            ? "Scanning Active"
            : "Scanning Stopped"}

        </span>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <input
          type="text"
          placeholder="Search SSID or MAC"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border p-3 rounded-xl"
        />

        <select
          value={riskFilter}
          onChange={(e) =>
            setRiskFilter(e.target.value)
          }
          className="border p-3 rounded-xl"
        >

          <option>
            All Risk Levels
          </option>

          <option>
            High
          </option>

          <option>
            Medium
          </option>

          <option>
            Low
          </option>

        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border p-3 rounded-xl"
        >

          <option>
            All Categories
          </option>

          <option>
            Authorized
          </option>

          <option>
            Unauthorized
          </option>

        </select>

      </div>

      {/* ================= STATS ================= */}

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

      {/* ================= SIGNALS ================= */}

      {loading ? (

        <div className="text-center py-20">
          Loading...
        </div>

      ) : filteredSignals.length === 0 ? (

        <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">

          <p className="text-xl text-gray-400">
            No signals detected.
          </p>

        </div>

      ) : (

        <div className="grid gap-4">

          {filteredSignals.map(signal => (

            <SignalCard
              key={signal.id}
              signal={signal}
              isAuthorized={
                authorizedSsids.includes(signal.ssid)
              }
              onDelete={deleteSignal}
            />

          ))}

        </div>

      )}

    </div>
  );
}

export default DashboardPage;