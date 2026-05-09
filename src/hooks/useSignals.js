import { useSignalContext } from "../context/SignalContext";

export default function useSignals() {
  const context = useSignalContext();
  if (!context) throw new Error("useSignals must be used within a SignalProvider");
  return context;
}