import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";

import {
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase/config";

import { useSignalContext } from "../../context/SignalContext";

import { useAuth } from "../../context/AuthContext";

import SignalCard from "../../components/Dashboard/SignalCard";

import {
  deleteSignal,
  deleteAllSignals,
} from "../../firebase/services";

import { dBmToRisk } from "../../utils/helpers";

import {
  Navigate,
  Link,
} from "react-router-dom";

function DashboardPage() {

  const {
    signals,
    routers,
    loading: signalsLoading,
  } = useSignalContext();

  const {
    profile,
    currentUser,
    loading: authLoading,
  } = useAuth();

  // ================= STATES =================

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");
  const [isScanning, setIsScanning] = useState(false);
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [room, setRoom] = useState("");

  // ================= AUDIO CONTROL (ONLY FIXED PART) =================

  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/alert.mp3"); // 👈 YOUR FILE IN PUBLIC FOLDER
      audioRef.current.volume = 1;
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // autoplay may be blocked in browser until user interaction
    });
  };

  // ================= AUTHORIZED SSIDS =================

  const authorizedDevices = useMemo(() => {
  return routers
    ? routers.map((r) => ({
        ssid: r.ssid?.trim().toLowerCase(),
        mac: r.mac?.trim().toLowerCase(),
      }))
    : [];
}, [routers]);

  const controlRef = useMemo(
    () => doc(db, "control", "scanner"),
    []
  );

  // ================= REALTIME SCANNER =================

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
  }, [controlRef]);

  // ================= FILTER ONLY UNAUTHORIZED =================

  const filteredSignals = useMemo(() => {

  if (!signals) return [];

  const filtered = signals.filter((signal) => {

    const risk = dBmToRisk(signal.rssi);

    const signalSSID =
      signal.ssid?.trim().toLowerCase();
      const signalMAC = signal.mac?.trim().toLowerCase();


    const isAuthorized = authorizedDevices.some((device) => {
  return (
    device.ssid === signalSSID &&
    device.mac === signalMAC
  );
});

    // REMOVE AUTHORIZED NETWORKS
    if (isAuthorized) return false;

    const matchesSearch =
      signal.ssid
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      signal.mac
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "All Risk Levels" ||
      risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // ================= SORT BY STRONGEST RSSI =================
  // Higher RSSI (-40) comes before lower RSSI (-80)

  filtered.sort((a, b) => {
    return b.rssi - a.rssi;
  });

  return filtered;

}, [
  signals,
  search,
  riskFilter,
  authorizedDevices,
]);
  // ================= 🔊 MP3 ALERT SYSTEM (FIXED) =================

  useEffect(() => {

    // STOP OLD SOUND FIRST
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (isScanning && filteredSignals.length > 0) {

      playSound(); // immediate

      intervalRef.current = setInterval(() => {
        playSound();
      }, 8000); // repeat every 8 sec
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

  }, [filteredSignals, isScanning]);

  // ================= LOADING =================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold text-lg">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (profile === null || profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold text-lg">
          Loading Profile...
        </p>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  if (profile?.isApproved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-yellow-200 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-6">
            <span className="text-4xl">⏳</span>
          </div>

          <h1 className="text-3xl font-black text-yellow-700 mb-4">
            Account Pending Approval
          </h1>

          <p className="text-slate-600 leading-relaxed font-medium">
            Your account has been created successfully.
            <br />
            Please wait for the administrator to approve your access.
          </p>

          <Link
            to="/login"
            className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ================= START SCAN =================

  async function startScanning() {
    if (!department || !year || !room) {
      alert("Please select Department, Year and Room");
      return;
    }

    await setDoc(controlRef, {
      status: "start",
      department,
      year,
      room,
    });
  }

  // ================= STOP SCAN =================

  async function stopScanning() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    await setDoc(controlRef, {
      status: "stop",
      department,
      year,
      room,
    });
  }

  // ================= DELETE ALL =================

  async function handleDeleteAll() {
    if (!isAdmin) return;

    const ok = window.confirm("Delete ALL scanned signals?");
    if (!ok) return;

    await deleteAllSignals(filteredSignals);
  }

  // ================= UI =================

  const totalDevices = filteredSignals.length;
  const unauthorizedCount = filteredSignals.length;

  // ================= DASHBOARD =================

  return (

    <div className="space-y-6">

      {/* FILTERS */}

      <div className="grid md:grid-cols-3 gap-4">

        <select
          value={department}
          onChange={(e) =>
            setDepartment(
              e.target.value
            )
          }
          className="border p-3 rounded-xl bg-white"
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
            setYear(
              e.target.value
            )
          }
          className="border p-3 rounded-xl bg-white"
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
            setRoom(
              e.target.value
            )
          }
          placeholder="Enter Room Number"
          className="border p-3 rounded-xl bg-white"
        />

      </div>

      {/* BUTTONS */}

      <div className="flex flex-wrap gap-4 items-center">

        <button
          onClick={startScanning}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >

          Start Scanning

        </button>

        <button
          onClick={stopScanning}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
        >

          Stop Scanning

        </button>

        {isAdmin && (

          <button
            onClick={
              handleDeleteAll
            }
            className="ml-auto bg-black text-white px-6 py-3 rounded-xl font-bold"
          >

            Delete All Scanned

          </button>
        )}

      </div>

      {/* STATUS */}

      <div>

        <span
          className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
            isScanning
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >

          {isScanning
            ? "Scanning System: Active"
            : "Scanning System: Off"}

        </span>

      </div>

      {/* SEARCH */}

      <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-sm">

        <input
          type="text"
          placeholder="Search SSID or MAC"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-3 rounded-xl"
        />

        <select
          value={riskFilter}
          onChange={(e) =>
            setRiskFilter(
              e.target.value
            )
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

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm">

          <p className="text-sm text-gray-400">

            Total Devices

          </p>

          <h1 className="text-3xl font-black">

            {totalDevices}

          </h1>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">

          <p className="text-sm text-gray-400">

            Unauthorized

          </p>

          <h1 className="text-3xl font-black text-red-600">

            {unauthorizedCount}

          </h1>

        </div>

      </div>

      {/* SIGNALS */}

      {signalsLoading ? (

        <div className="text-center py-10">

          Loading network logs...

        </div>

      ) : filteredSignals.length === 0 ? (

        <div className="bg-white p-10 rounded-2xl text-center">

          No unauthorized signals found.

        </div>

      ) : (

        <div className="grid gap-4">

          {filteredSignals.map(
            (signal) => (

              <SignalCard
                key={signal.id}
                signal={signal}
                isAdmin={isAdmin}
                isAuthorized={false}
                onDelete={
                  deleteSignal
                }
              />

            )
          )}

        </div>

      )}

    </div>
  );
}

export default DashboardPage;