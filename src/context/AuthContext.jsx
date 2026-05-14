import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Login Handler Function
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout Handler Function
  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Clean up previous real-time profile listeners to prevent memory leaks
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);
        
        // Auto-seed Admin profile if the specific master email logs in
        if (user.email === "teddy@gmail.com") {
          await setDoc(userRef, {
            email: user.email,
            role: "admin",
            isApproved: true
          }, { merge: true });
        } else {
          // Check if document exists first instead of blinding destroying data with un-hydrated auth object fields
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, {
              email: user.email,
              role: "user",
              isApproved: false
            }, { merge: true });
          }
        }

        // Establish distinct single-user snapshot channel feed
        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile({ email: user.email, role: "user", isApproved: false });
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile synchronization channel error:", err);
          setLoading(false);
        });

      } else {
        setCurrentUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [auth]);

  return (
    <AuthContext.Provider value={{ currentUser, profile, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);