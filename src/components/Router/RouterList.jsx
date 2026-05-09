import React from "react";
import { deleteRouter } from "../../firebase/services";
import { useSignalContext } from "../../context/SignalContext";

function RouterList() {

  const { routers, setRouters } = useSignalContext();

  async function handleDelete(id) {
    await deleteRouter(id);
    setRouters(prev => prev.filter(r => r.id !== id));
  }

  return (

    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">SSID</th>
            <th className="p-4 text-left">MAC Address</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody>

          {routers.map(router => (
            <tr key={router.id} className="border-t hover:bg-gray-50">

              {/* SSID */}
              <td className="p-4 font-bold">
                {router.ssid}
              </td>

              {/* MAC */}
              <td className="p-4 text-gray-600">
                {router.mac}
              </td>

              {/* ACTION */}
              <td className="p-4 text-right">

                <button
                  onClick={() => handleDelete(router.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );
}

export default RouterList;