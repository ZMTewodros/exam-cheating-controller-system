import React, { useState } from "react";
import { addRouter } from "../../firebase/services";
import { useSignalContext } from "../../context/SignalContext";

function AddRouter() {

  const [ssid, setSsid] = useState("");
  const [mac, setMac] = useState("");
  const [loading, setLoading] = useState(false);

  const { setRouters } = useSignalContext();

  async function handleAdd(e) {
    e.preventDefault();

    if (!ssid || !mac || loading) return;

    setLoading(true);

    try {
      const docRef = await addRouter({
        ssid,
        mac
      });

      setRouters(prev => [
        ...prev,
        {
          id: docRef.id,
          ssid,
          mac
        }
      ]);

      setSsid("");
      setMac("");

    } catch (error) {
      console.error("Failed to add router:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-lg p-8 rounded-2xl border">

      <form onSubmit={handleAdd} className="space-y-5">

        {/* SSID */}
        <div>
          <label className="text-sm font-bold">SSID Name</label>
          <input
            className="w-full border p-3 rounded-xl"
            value={ssid}
            onChange={e => setSsid(e.target.value)}
            required
          />
        </div>

        {/* MAC */}
        <div>
          <label className="text-sm font-bold">MAC Address (Security Key)</label>
          <input
            className="w-full border p-3 rounded-xl"
            value={mac}
            onChange={e => setMac(e.target.value)}
            placeholder="AA:BB:CC:DD:EE:FF"
            required
          />
        </div>

        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
          {loading ? "Adding..." : "Add Authorized Device"}
        </button>

      </form>

    </div>
  );
}

export default AddRouter;