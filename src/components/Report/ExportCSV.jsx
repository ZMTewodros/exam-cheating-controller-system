import React from "react";

function ExportCSV({ logs, authorizedSsids }) {
  function downloadCSV() {
    if (logs.length === 0) return alert("No data to export!");

    const headers = ["Timestamp", "Category", "SSID", "MAC", "Room", "Signal(dBm)", "Risk Status"];
    
    const rows = logs.map(log => {
      const isAuth = authorizedSsids.includes(log.ssid);
      const signalVal = log.rssi ?? log.dBm ?? -100;
      
      const timestamp = log.timestamp?.seconds 
        ? new Date(log.timestamp.seconds * 1000).toLocaleString().replace(',', '') 
        : "N/A";

      return [
        timestamp,
        isAuth ? "AUTHORIZED" : "UNAUTHORIZED", 
        log.ssid || "Hidden",
        log.mac,
        log.room || "Exam Hall A",
        signalVal,
        isAuth ? "Safe" : "Threat/Risk"
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    a.href = url;
    a.download = `exam_guard_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button 
      onClick={downloadCSV} 
      disabled={logs.length === 0}
      className={`font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3 ${
        logs.length === 0 
        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
      }`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Data
    </button>
  );
}

export default ExportCSV;