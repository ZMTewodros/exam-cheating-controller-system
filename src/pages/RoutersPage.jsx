import React from "react";
import AddRouter from "../components/Router/AddRouter";
import RouterList from "../components/Router/RouterList";

function RoutersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Authorized Routers (Whitelist)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddRouter />
        <RouterList />
      </div>
    </div>
  );
}
export default RoutersPage;