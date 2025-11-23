import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import axios from "axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setMessage({ text: "Invalid or missing reset code.", type: "error" });
      return;
    }
    setOobCode(code);

    // Verify code to get associated email
    verifyPasswordResetCode(auth, code)
      .then((emailAddr) => setEmail(emailAddr))
      .catch((err) =>
        setMessage({ text: err.message || "Invalid reset code.", type: "error" })
      );
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oobCode) return;
    if (!password || password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);

      // sign in the user to get uid and token, then optionally sync to backend
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;
      const token = await firebaseUser.getIdToken();

      // attempt to sync to backend (non-blocking)
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE}/api/auth/sync`, {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || "",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          provider: "password",
        });
      } catch (syncErr) {
        console.error("Sync after reset failed:", syncErr);
      }

      // store and navigate
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ _id: firebaseUser.uid, uid: firebaseUser.uid, email: firebaseUser.email })
      );
      localStorage.setItem("token", token);

      setMessage({ text: "Password reset successful. Redirecting...", type: "success" });
      setTimeout(() => navigate("/chat"), 1200);
    } catch (err) {
      setMessage({ text: err.message || "Failed to reset password.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
        {message.text && (
          <div className={`text-sm mb-4 ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        {!message.text || message.type !== "error" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-600">Email</label>
              <input type="email" value={email} readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-100" />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-black text-white rounded-lg">
                {loading ? "Saving..." : "Save new password"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2 border rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </motion.div>
    </div>
  );
}
