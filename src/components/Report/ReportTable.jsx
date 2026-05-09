import React, { useEffect, useMemo, useState } from "react";
import { getReports } from "../../firebase/services";
import { useSignalContext } from "../../context/SignalContext";
import { dBmToRisk } from "../../utils/helpers";
import ExportCSV from "./ExportCSV";

function ReportTable() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // ✅ CHANGED: ROOM FILTER → TEXT SEARCH
  const [roomSearch, setRoomSearch] = useState("");

  const [dateFilter, setDateFilter] = useState("");

  const { routers } = useSignalContext();

  const authorizedSsids = routers.map((r) => r.ssid);

  async function loadData() {

    setLoading(true);

    const data = await getReports();

    const sorted = data.sort((a, b) => {

      const timeA = a.timestamp?.seconds
        ? a.timestamp.seconds * 1000
        : 0;

      const timeB = b.timestamp?.seconds
        ? b.timestamp.seconds * 1000
        : 0;

      return timeB - timeA;
    });

    setLogs(sorted);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function formatDateTime(timestamp) {
    if (!timestamp?.seconds) {
      return "No Time";
    }

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  }

  // ================= FILTER LOGIC =================

  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const isAuth = authorizedSsids.includes(log.ssid || "");
      const signalVal = log.rssi ?? log.dBm ?? -100;
      const risk = dBmToRisk(signalVal) || "Low";

      const matchesSearch =
        (log.ssid || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.mac || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" ||
        (categoryFilter === "AUTHORIZED" && isAuth) ||
        (categoryFilter === "UNAUTHORIZED" && !isAuth);

      const matchesRisk =
        riskFilter === "ALL" ||
        (risk || "").toUpperCase() === riskFilter;

      // ✅ UPDATED ROOM LOGIC (TEXT SEARCH)
      const matchesRoom =
        roomSearch === "" ||
        (log.room || "")
          .toLowerCase()
          .includes(roomSearch.toLowerCase());

      let matchesDate = true;

      if (dateFilter) {

        const logDate = log.timestamp?.seconds
          ? new Date(log.timestamp.seconds * 1000)
          : new Date();

        const formatted =
          logDate.getFullYear() +
          "-" +
          String(logDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(logDate.getDate()).padStart(2, "0");

        matchesDate = formatted === dateFilter;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRisk &&
        matchesRoom &&
        matchesDate
      );

    });

  }, [
    logs,
    search,
    categoryFilter,
    riskFilter,
    roomSearch,
    dateFilter,
    authorizedSsids
  ]);

  const totalDevices = filteredLogs.length;

  const authorizedCount = filteredLogs.filter((log) =>
    authorizedSsids.includes(log.ssid)
  ).length;

  const unauthorizedCount = totalDevices - authorizedCount;

  function clearFilters() {
    setSearch("");
    setCategoryFilter("ALL");
    setRiskFilter("ALL");
    setRoomSearch(""); // ✅ UPDATED
    setDateFilter("");
  }

  return (

    <div className="max-w-7xl mx-auto px-4 space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Reports & Logs
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Review, filter and export device detection history
            </p>
          </div>

          <ExportCSV
            logs={filteredLogs}
            authorizedSsids={authorizedSsids}
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs uppercase font-bold text-gray-400">
            Filtered Devices
          </p>
          <h2 className="text-3xl font-black text-slate-800 mt-2">
            {totalDevices}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
          <p className="text-xs uppercase font-bold text-gray-400">
            Authorized
          </p>
          <h2 className="text-3xl font-black text-green-600 mt-2">
            {authorizedCount}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
          <p className="text-xs uppercase font-bold text-gray-400">
            Unauthorized
          </p>
          <h2 className="text-3xl font-black text-red-600 mt-2">
            {unauthorizedCount}
          </h2>
        </div>

      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Search SSID or MAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTHORIZED">Authorized</option>
            <option value="UNAUTHORIZED">Unauthorized</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* ✅ ROOM SEARCH INPUT (REPLACED DROPDOWN) */}
          <input
            type="text"
            placeholder="Search Room (e.g.100)"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3"
          />

        </div>

        <div className="flex flex-wrap gap-4 mt-6">

          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Refresh Data
          </button>

          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition"
          >
            Clear Filters
          </button>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full text-left">

            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">SSID</th>
                <th className="px-8 py-5">MAC Address</th>
                <th className="px-8 py-5">Room</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Signal</th>
                <th className="px-8 py-5">Risk</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-gray-400">
                    Loading data...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-gray-400">
                    No matching logs found.
                  </td>
                </tr>
              ) : (

                filteredLogs.map((log) => {

                  const isAuth = authorizedSsids.includes(log.ssid);
                  const signalVal = log.rssi ?? log.dBm ?? -100;
                  const risk = dBmToRisk(signalVal);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">

                      <td className="px-8 py-5 text-xs font-bold text-gray-500">
                        {formatDateTime(log.timestamp)}
                      </td>

                      <td className="px-8 py-5 font-bold text-slate-800">
                        {log.ssid || "Hidden"}
                      </td>

                      <td className="px-8 py-5 text-xs font-mono text-gray-500">
                        {log.mac}
                      </td>

                      <td className="px-8 py-5 text-sm text-gray-600">
                        {log.room || "Exam Hall A"}
                      </td>

                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isAuth
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {isAuth ? "Authorized" : "Unauthorized"}
                        </span>
                      </td>

                      <td className="px-8 py-5 font-black text-slate-700">
                        {signalVal} dBm
                      </td>

                      <td className="px-8 py-5">
                        <span className={`font-black uppercase text-xs ${
                          isAuth
                            ? "text-green-600"
                            : risk === "High"
                            ? "text-red-600"
                            : risk === "Medium"
                            ? "text-yellow-600"
                            : "text-gray-500"
                        }`}>
                          {isAuth ? "Safe" : risk}
                        </span>
                      </td>

                    </tr>
                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ReportTable;