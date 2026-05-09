import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./config";

// ================= SIGNALS =================

export function onSignalsUpdate(callback) {

  const q = query(collection(db, "signals"));

  return onSnapshot(q, (snapshot) => {

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const sortedData = data.sort((a, b) => {
      const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0;
      const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0;
      return timeB - timeA;
    });

    callback(sortedData);

  }, (error) => {
    console.error("Firestore Listen Error:", error);
  });
}

// ================= SIGNALS =================

export async function addSignal(signalData) {
  return await addDoc(collection(db, "signals"), {
    ...signalData,
    timestamp: serverTimestamp()
  });
}

export async function deleteSignal(id) {
  return await deleteDoc(doc(db, "signals", id));
}

export async function deleteAllSignals(signals) {
  for (const signal of signals) {
    await deleteDoc(doc(db, "signals", signal.id));
  }
}

// ================= ROUTERS (UPDATED SECURITY MODEL) =================

// 🔐 ADD ROUTER (SSID + MAC)
export async function addRouter(router) {
  return await addDoc(collection(db, "routers"), {
    ssid: router.ssid,
    mac: router.mac,          // 🔥 IMPORTANT FOR ANTI-SPOOFING
    createdAt: serverTimestamp()
  });
}

// GET ROUTERS
export async function getRouters() {
  const snap = await getDocs(collection(db, "routers"));

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// DELETE ROUTER
export async function deleteRouter(id) {
  return await deleteDoc(doc(db, "routers", id));
}

// ================= REPORTS =================

export async function getReports() {
  const snap = await getDocs(collection(db, "signals"));

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}