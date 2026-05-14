import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

function UserManagementPage() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (authLoading || !profile) return;
    if (profile.role !== "admin") return;

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    });

    return () => unsub();
  }, [profile, authLoading]);

  async function toggleApproval(userId, currentStatus) {
    try {
      setUpdatingId(userId);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isApproved: !currentStatus,
      });
    } catch (error) {
      console.error("Failed to update user privilege status:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  // New deletion handler logic
  async function deleteUserAccount(userId) {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this user account?");
    if (!confirmDelete) return;

    try {
      setUpdatingId(userId);
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Failed to remove user document:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-slate-500 font-medium animate-pulse">Verifying administration privileges...</div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <div className="text-red-600 font-black text-xl mb-2">Unauthorized view access.</div>
          <p className="text-red-500 text-sm">You do not have administrative access permission rights to view this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">User Access Management</h2>
        <p className="text-slate-500 mt-2 font-medium">Approve or restrict proctor access control records</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-8 py-5">User Email</th>
                <th className="px-8 py-5">System Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-gray-400 text-center">Loading registered records...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-gray-400 text-center">No accounts listed.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition border-b border-gray-50">
                    <td className="px-8 py-5 font-bold text-slate-800">{u.email}</td>
                    <td className="px-8 py-5 text-sm text-gray-600 uppercase font-mono tracking-wider">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {u.isApproved ? "Approved & Active" : "Pending Approval"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {u.email !== "teddy@gmail.com" ? (
                        <div className="flex items-center justify-end gap-2">
                          {/* Approval / Revocation Button */}
                          <button
                            onClick={() => toggleApproval(u.id, u.isApproved)}
                            disabled={updatingId === u.id}
                            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition min-w-[120px] ${
                              updatingId === u.id 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : u.isApproved 
                                  ? "bg-amber-500 hover:bg-amber-600" 
                                  : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {updatingId === u.id ? "Updating..." : u.isApproved ? "Revoke Access" : "Approve User"}
                          </button>

                          {/* Delete Account Button */}
                          <button
                            onClick={() => deleteUserAccount(u.id)}
                            disabled={updatingId === u.id}
                            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                              updatingId === u.id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Master Root Admin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagementPage;