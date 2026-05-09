// import { addSignal } from "../firebase/services";

// // Fake device signals
// const FAKE_SSIDS = [
//   { ssid: "AndroidAP", mac: "CA:FE:FA:KE:01", dBm: -40 },
//   { ssid: "Iphone-17", mac: "A1:B2:C3:D4:E5:F6", dBm: -80 },
//   { ssid: "StudentPhone99", mac: "DE:AD:BE:EF:01:23", dBm: -45 }
// ];

// // Send fake signals for dev
// export async function sendFakeSignals(room = "Room 101") {
//   for (let s of FAKE_SSIDS) {
//     await addSignal({
//       ssid: s.ssid,
//       mac: s.mac,
//       dBm: s.dBm,
//       timestamp: Date.now(),
//       room
//     });
//   }
// }