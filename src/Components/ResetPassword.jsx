import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { getErrorMessage } from "../utils/error";
import axios from "axios";
import { getApiBase } from "../utils/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (resetComplete) return;

    const code = searchParams.get("oobCode");

    if (!code) {
      setMessage({
        text: "No reset code found. Please use the password reset link from your email.",
        type: "error",
      });
      setVerifying(false);
      return;
    }

    setOobCode(code);

    // Verify code and get associated email
    verifyPasswordResetCode(auth, code)
      .then((emailAddr) => {
        setEmail(emailAddr);
        setVerifying(false);
      })
      .catch((err) => {
        let errorMsg =
          "This reset link is invalid or has expired. Please request a new one.";

        if (err.code === "auth/invalid-action-code") {
          errorMsg =
            "This reset link has already been used or has expired. Please request a new password reset.";
        } else if (err.code === "auth/expired-action-code") {
          errorMsg =
            "This reset link has expired. Please request a new password reset.";
        }

        setMessage({
          text: getErrorMessage(err) || errorMsg,
          type: "error",
        });
        setVerifying(false);
      });
  }, [searchParams, resetComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oobCode) {
      setMessage({
        text: "Invalid reset code. Please request a new password reset link.",
        type: "error",
      });
      return;
    }

    if (!password || password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      // Reset the password
      await confirmPasswordReset(auth, oobCode, password);

      // Sign in the user automatically
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;
      const token = await firebaseUser.getIdToken();

      // Sync to backend (non-blocking - don't fail if this doesn't work)
      try {
        const API_BASE_URL = getApiBase();
        await axios.post(`${API_BASE_URL}/api/auth/sync`, {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || "",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          provider: "password",
        });
      } catch (syncErr) {
        console.error("Backend sync failed:", syncErr);
      }

      // Store user data
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          _id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        })
      );
      localStorage.setItem("token", token);

      // Mark reset as complete to prevent re-verification
      setResetComplete(true);

      setMessage({
        text: "Password reset successful! Redirecting...",
        type: "success",
      });

      // Navigate immediately to prevent re-verification of used code
      setTimeout(() => navigate("/chat", { replace: true }), 1000);
    } catch (err) {
      setMessage({
        text:
          getErrorMessage(err) || "Failed to reset password. Please try again.",
        type: "error",
      });
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

        {verifying ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        ) : (
          <>
            {message.text && (
              <div
                className={`text-sm mb-4 p-3 rounded-lg ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {message.type !== "error" && email && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-600">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/chat/login")}
                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {message.type === "error" && (
              <div className="mt-4 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  To reset your password, please click the link sent to your
                  email.
                </p>
                <button
                  onClick={() => navigate("/chat/login")}
                  className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Back to Login
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
