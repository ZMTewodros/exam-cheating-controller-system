import React, { createContext, useContext, useState, useEffect } from "react";
import { onSignalsUpdate, getRouters } from "../firebase/services";

const SignalContext = createContext();

export function SignalProvider({ children }) {
  const [signals, setSignals] = useState([]);
  const [routers, setRouters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSignals = onSignalsUpdate((data) => {
      console.log("Signals received from Firestore:", data);
      setSignals(data);
      setLoading(false);
    });

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

export const useSignalContext = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error("useSignalContext must be used within a SignalProvider");
  }
  return context;
};

export default SignalContext;