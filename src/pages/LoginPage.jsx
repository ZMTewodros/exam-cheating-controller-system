import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 🔥 Added Link component here
import { useAuth } from "../context/AuthContext";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isRegistering && password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      if (isRegistering) {
        // Sign up logic for user creation
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Initialize user document record instantly on register trigger inside Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          isApproved: false
        });

        setSuccess("Account created successfully! Contact an admin for authorization access.");
        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        // Execution sequence for sign-in queries
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      if (isRegistering) {
        setError(err.message.includes("email-already-in-use") 
          ? "This email address is already registered." 
          : "Failed to create an account. Password must be at least 6 characters.");
      } else {
        setError("Invalid credentials. Please verify your email and password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          {/* 🔥 Wrapped heading in a Link component pointing to root path "/" */}
          <Link to="/" className="inline-block group focus:outline-none">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight transition duration-200 group-hover:text-blue-600">
              EXAM GUARD
            </h2>
          </Link>
          <p className="text-sm font-medium text-slate-500 mt-2">
            {isRegistering ? "Register a new proctor supervisor account" : "Sign in to monitor  devices"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 font-semibold p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 font-semibold p-4 rounded-xl mb-6 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@examguard.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Account Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl transition mt-2 shadow-md shadow-blue-600/20"
          >
            {loading ? "Processing..." : isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm font-medium text-slate-600">
            {isRegistering ? "Already have an account?" : "Don't have an account yet?"}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
                setSuccess("");
              }}
              className="text-blue-600 hover:text-blue-700 font-bold ml-2 underline focus:outline-none"
            >
              {isRegistering ? "Sign In Here" : "Create an Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;