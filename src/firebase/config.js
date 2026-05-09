import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkhJr6ku-QWaQs9Iy9f_HpbmEtKYFYYME",
  authDomain: "exam-cheating-controller.firebaseapp.com",
  projectId: "exam-cheating-controller",
  storageBucket: "exam-cheating-controller.firebasestorage.app",
  messagingSenderId: "738775931289",
  appId: "1:738775931289:web:027674485b9a4c5032db08",
  measurementId: "G-P8NT3HS12E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);