import React from "react";

import { dBmToRisk } from "../../utils/helpers";

function SignalCard({
  signal,
  isAuthorized,
  onDelete
}) {

  const signalValue =
    signal.rssi !== undefined
      ? signal.rssi
      : -100;

  const risk = dBmToRisk(signalValue);

  return (

    <div className={`p-5 rounded-2xl border-l-8 shadow-sm bg-white flex justify-between items-center transition hover:shadow-md ${
      isAuthorized
        ? "border-green-500"
        : risk === "High"
        ? "border-red-500"
        : "border-yellow-500"
    }`}>

      <div className="flex-1">

        <div className="flex items-center gap-3 flex-wrap">

          <span className="font-bold text-xl text-gray-800">
            {signal.ssid || "Hidden Network"}
          </span>

          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
            isAuthorized
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>

            {isAuthorized
              ? "Authorized"
              : "Unauthorized"}

          </span>

        </div>

        <div className="mt-2 space-y-1">

          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-400">
              MAC:
            </span>{" "}
            {signal.mac}
          </p>

          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-400">
              Channel:
            </span>{" "}
            {signal.channel}
          </p>

          <p className="text-xs text-gray-400 font-semibold uppercase">
            Location:
            {" "}
            {signal.room || "Exam Hall A"}
          </p>

        </div>

      </div>

      <div className="text-right">

        <div className={`text-3xl font-mono font-black ${
          risk === "High" && !isAuthorized
            ? "text-red-600"
            : "text-slate-700"
        }`}>

          {signalValue}
          <span className="text-sm ml-1">
            dBm
          </span>

        </div>

        <div className={`text-xs uppercase font-black mt-1 px-2 py-1 rounded-md inline-block ${
          isAuthorized
            ? "bg-green-50 text-green-600"
            : risk === "High"
            ? "bg-red-50 text-red-600"
            : "bg-yellow-50 text-yellow-700"
        }`}>

          {isAuthorized
            ? "Status: Safe"
            : `Risk: ${risk}`}

        </div>

        <div>

          <button
            onClick={() => onDelete(signal.id)}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default SignalCard;