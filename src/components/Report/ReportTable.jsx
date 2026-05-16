import React, { useEffect, useMemo, useState } from "react";
import { getReports, deleteAllSignals } from "../../firebase/services";
import { useSignalContext } from "../../context/SignalContext";
import { useAuth } from "../../context/AuthContext";
import { dBmToRisk } from "../../utils/helpers";
import ExportCSV from "./ExportCSV";

function ReportTable() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [roomSearch, setRoomSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { routers } = useSignalContext();
  const { profile } = useAuth();

  const isAdmin = profile?.role === "admin";

  const authorizedSsids = useMemo(
    () => routers.map((r) => r.ssid),
    [routers]
  );

  async function loadData() {

    setLoading(true);

    const data = await getReports();

    const sorted = data.sort((a, b) => {

      const timeA =
        a.timestamp instanceof Date
          ? a.timestamp.getTime()
          : 0;

      const timeB =
        b.timestamp instanceof Date
          ? b.timestamp.getTime()
          : 0;

      return timeB - timeA;

    });

    setLogs(sorted);

    setLoading(false);
  }

  useEffect(() => {

    loadData();

  }, []);

  // ================= DELETE ALL =================
  async function handleDeleteAll() {

    if (!isAdmin) return;

    const ok = window.confirm(
      "Delete ALL scanned reports?"
    );

    if (!ok) return;

    await deleteAllSignals(logs);

    loadData();
  }

  // ================= FORMAT DATE =================
  function formatDateTime(timestamp) {

    if (!timestamp) return "--- at ---";

    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp);

    if (isNaN(date.getTime()))
      return "Invalid at Date";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).replace(", ", " at ");
  }

  // ================= FILTER LOGIC =================
  // ONLY UNAUTHORIZED SIGNALS
  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const isAuth =
        authorizedSsids.includes(log.ssid || "");

      // HIDE AUTHORIZED SIGNALS
      if (isAuth) return false;

      const signalVal =
        log.rssi ?? log.dBm ?? -100;

      const risk =
        dBmToRisk(signalVal) || "Low";

      const matchesSearch =
        (log.ssid || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (log.mac || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRisk =
        riskFilter === "ALL" ||
        (risk || "").toUpperCase() === riskFilter;

      const matchesRoom =
        roomSearch === "" ||
        (log.room || "")
          .toLowerCase()
          .includes(roomSearch.toLowerCase());

      const matchesDepartment =
        departmentFilter === "" ||
        (log.department || "") === departmentFilter;

      const normalizeYear = (y) => {

        if (y === null || y === undefined)
          return "";

        return String(y)
          .trim()
          .replace(/\D/g, "");
      };

      const matchesYear =
        yearFilter === "" ||
        normalizeYear(log.year) ===
          normalizeYear(yearFilter);

      let matchesDate = true;

      if (dateFilter && log.timestamp) {

        const logDate = log.timestamp;

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
        matchesRisk &&
        matchesRoom &&
        matchesDepartment &&
        matchesYear &&
        matchesDate
      );
    });

  }, [
    logs,
    search,
    riskFilter,
    roomSearch,
    departmentFilter,
    yearFilter,
    dateFilter,
    authorizedSsids,
  ]);

  const totalDevices = useMemo(
    () => filteredLogs.length,
    [filteredLogs]
  );

  const unauthorizedCount = totalDevices;

  // ================= CLEAR FILTERS =================
  function clearFilters() {

    setSearch("");

    setRiskFilter("ALL");

    setRoomSearch("");

    setDepartmentFilter("");

    setYearFilter("");

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

          <div className="flex flex-wrap gap-4">

            <ExportCSV
              logs={filteredLogs}
              authorizedSsids={authorizedSsids}
            />

            {isAdmin && (

              <button
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition"
              >
                Delete All Reports
              </button>

            )}

          </div>

        </div>

      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Search SSID or MAC..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-3"
          >

            <option value="ALL">
              All Risk Levels
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>

          <input
            type="text"
            placeholder="Search Room (e.g. 100)"
            value={roomSearch}
            onChange={(e) =>
              setRoomSearch(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-3"
          />

          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-3"
          >

            <option value="">
              All Departments
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
            value={yearFilter}
            onChange={(e) =>
              setYearFilter(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-3"
          >

            <option value="">
              All Years
            </option>

            <option value="1">
              Year 1
            </option>

            <option value="2">
              Year 2
            </option>

            <option value="3">
              Year 3
            </option>

            <option value="4">
              Year 4
            </option>

            <option value="5">
              Year 5
            </option>

          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
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

        <div className="px-6 py-4 border-b text-sm font-bold text-slate-700">

          Total Devices (Filtered): {totalDevices}
          {" | "}
          Unauthorized: {unauthorizedCount}

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-left">

            <thead>

              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">

                <th className="px-8 py-5">
                  Date & Time
                </th>

                <th className="px-8 py-5">
                  SSID
                </th>

                <th className="px-8 py-5">
                  MAC Address
                </th>

                <th className="px-8 py-5">
                  Room
                </th>

                <th className="px-8 py-5">
                  Department
                </th>

                <th className="px-8 py-5">
                  Year
                </th>

                <th className="px-8 py-5">
                  Category
                </th>

                <th className="px-8 py-5">
                  Signal
                </th>

                <th className="px-8 py-5">
                  Risk
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td className="px-8 py-10 text-gray-400">
                    Loading...
                  </td>

                </tr>

              ) : filteredLogs.length === 0 ? (

                <tr>

                  <td className="px-8 py-10 text-gray-400">
                    No unauthorized signals found.
                  </td>

                </tr>

              ) : (

                filteredLogs.map((log) => {

                  const signalVal =
                    log.rssi ?? log.dBm ?? -100;

                  const risk =
                    dBmToRisk(signalVal);

                  const dateTimeStr =
                    formatDateTime(log.timestamp);

                  return (

                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-8 py-5 text-xs font-bold text-gray-500 whitespace-nowrap">

                        <div className="flex flex-col">

                          <span>
                            {dateTimeStr.split(" at ")[0]}
                          </span>

                          <span className="text-blue-500 font-medium">
                            {dateTimeStr.split(" at ")[1]}
                          </span>

                        </div>

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

                      <td className="px-8 py-5 text-sm text-gray-600">
                        {log.department || "-"}
                      </td>

                      <td className="px-8 py-5 text-sm text-gray-600">
                        {log.year || "-"}
                      </td>

                      <td className="px-8 py-5">

                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">

                          Unauthorized

                        </span>

                      </td>

                      <td className="px-8 py-5 font-black text-slate-700">
                        {signalVal} dBm
                      </td>

                      <td className="px-8 py-5">

                        <span className={`font-black uppercase text-xs ${
                          risk === "High"
                            ? "text-red-600"
                            : risk === "Medium"
                            ? "text-yellow-600"
                            : "text-gray-500"
                        }`}>

                          {risk}

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