import React, { createContext, useContext, useState, useEffect } from "react";
import { onSignalsUpdate, getRouters } from "../firebase/services";

// 1. Create the Context
const SignalContext = createContext();

// 2. The Provider Component
export function SignalProvider({ children }) {
  const [signals, setSignals] = useState([]);
  const [routers, setRouters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live listener for signals from Firestore
    const unsubSignals = onSignalsUpdate((data) => {
      console.log("Signals received from Firestore:", data);
      setSignals(data);
      setLoading(false);
    });

    // Fetch authorized routers (whitelist)
    getRouters()
      .then((data) => setRouters(data))
      .catch((err) => console.error("Router fetch error:", err));

    return () => {
      if (unsubSignals) unsubSignals();
    };
  }, []);

  return (
    <SignalContext.Provider value={{ signals, routers, loading, setRouters, setSignals }}>
      {children}
    </SignalContext.Provider>
  );
}

// 3. The Custom Hook (This is what Dashboard calls)
export const useSignalContext = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error("useSignalContext must be used within a SignalProvider");
  }
  return context;
};

export default SignalContext;