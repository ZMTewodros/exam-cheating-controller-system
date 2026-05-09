export function dBmToRisk(dBm) {

  if (dBm >= -50) return "High";

  if (dBm >= -70) return "Medium";

  return "Low";
}