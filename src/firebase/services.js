import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  writeBatch
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

      const timeA =
        a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : 0;

      const timeB =
        b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : 0;

      return timeB - timeA;
    });

    callback(sortedData);

  }, (error) => {

    console.error(
      "Firestore Listen Error:",
      error
    );

  });
}

// ================= ADD SIGNAL =================

export async function addSignal(signalData) {

  return await addDoc(
    collection(db, "signals"),
    {
      ...signalData,
      timestamp: serverTimestamp()
    }
  );
}

// ================= DELETE SINGLE =================

export async function deleteSignal(id) {

  return await deleteDoc(
    doc(db, "signals", id)
  );
}

// ================= DELETE ALL FAST =================

export async function deleteAllSignals(signals) {

  if (!signals.length) return;

  try {

    const batch = writeBatch(db);

    signals.forEach((signal) => {

      const signalRef =
        doc(db, "signals", signal.id);

      batch.delete(signalRef);
    });

    await batch.commit();

    console.log("All signals deleted instantly");

  } catch (error) {

    console.error(
      "Delete All Error:",
      error
    );
  }
}

// ================= ROUTERS =================

// ADD ROUTER
export async function addRouter(router) {

  return await addDoc(
    collection(db, "routers"),
    {
      ssid: router.ssid,
      mac: router.mac,
      createdAt: serverTimestamp()
    }
  );
}

// GET ROUTERS
export async function getRouters() {

  const snap =
    await getDocs(collection(db, "routers"));

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// DELETE ROUTER
export async function deleteRouter(id) {

  return await deleteDoc(
    doc(db, "routers", id)
  );
}

// ================= REPORTS =================

export async function getReports() {
  const snap = await getDocs(collection(db, "signals"));
  return snap.docs.map(doc => {
    const data = doc.data();
    let dateObj = null;

    // Convert Firestore Timestamp to JS Date
    if (data.timestamp?.toDate) {
      dateObj = data.timestamp.toDate();
    } else if (data.timestamp?.seconds) {
      dateObj = new Date(data.timestamp.seconds * 1000);
    } else {
      dateObj = new Date(); // Fallback to current time if missing
    }

    return {
      id: doc.id,
      ...data,
      timestamp: dateObj 
    };
  });
}