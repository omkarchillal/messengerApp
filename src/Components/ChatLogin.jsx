import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdRemoveRedEye, MdArrowBack } from "react-icons/md";
import { AiFillEyeInvisible, AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { Fab, Box, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { getErrorMessage } from "../utils/error";
import illustration from "../assets/data-analysis-case-study.svg";
import { getApiBase } from "../utils/api";

export default function ChatLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const API_BASE_URL = getApiBase();

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setAlert({
        open: true,
        message: "Please enter your email address",
        severity: "warning",
      });
      return;
    }

    try {
      setForgotLoading(true);

      // Send password reset email
      // Note: Firebase will use its hosted page, then redirect back
      await sendPasswordResetEmail(auth, forgotEmail.toLowerCase());

      setAlert({
        open: true,
        message:
          "Password reset email sent! Check your inbox and click the link.",
        severity: "success",
      });
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      setAlert({
        open: true,
        message: getErrorMessage(err) || "Failed to send password reset email",
        severity: "error",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // 3. Fetch user from MongoDB using email
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Find user by email
      const user = res.data.find((u) => u.email === firebaseUser.email);
      if (!user) {
        throw new Error("User not found in database");
      }

      // 4. Save to localStorage
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          _id: user._id,
          uid: firebaseUser.uid,
          fullName: user.fullName,
          email: user.email,
          photoURL: user.photoURL,
        })
      );
      localStorage.setItem("token", token);

      setAlert({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
      navigate("/chat");
    } catch (err) {
      setAlert({
        open: true,
        message:
          getErrorMessage(err) || "Login failed. Check your credentials.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        {/* Back button - commented out for future use
        <Box
          sx={{ position: "fixed", top: "2rem", left: "2rem", zIndex: 1000 }}
        >
          <Fab
            onClick={() => navigate("/")}
            variant="extended"
            sx={{
              backgroundColor: "#26282A",
              color: "#fff",
              "&:hover": { backgroundColor: "#4b5347" },
            }}
          >
            <MdArrowBack style={{ marginRight: "0.5rem" }} /> Back
          </Fab>
        </Box>
        */}

        <motion.div
          className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-center mb-2">AppNexus Chat</h1>
          <p className="text-gray-500 text-center mb-6">
            Log in to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-600">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-lg text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <MdRemoveRedEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg bg-black hover:bg-gray-800"
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin mx-auto" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-400 text-xs">or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                const result = await signInWithPopup(auth, googleProvider);
                const firebaseUser = result.user;
                const token = await firebaseUser.getIdToken();

                // Sync to MongoDB
                const res = await axios.post(`${API_BASE_URL}/api/auth/sync`, {
                  uid: firebaseUser.uid,
                  fullName: firebaseUser.displayName || "User",
                  email: firebaseUser.email,
                  photoURL: firebaseUser.photoURL,
                  provider: "google",
                });

                localStorage.setItem(
                  "currentUser",
                  JSON.stringify({
                    _id: res.data.user._id,
                    uid: firebaseUser.uid,
                    fullName: firebaseUser.displayName || "User",
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                  })
                );
                localStorage.setItem("token", token);

                setAlert({
                  open: true,
                  message: "Google login successful!",
                  severity: "success",
                });
                setTimeout(() => navigate("/chat"), 1500);
              } catch (err) {
                setAlert({
                  open: true,
                  message: getErrorMessage(err) || "Google login failed",
                  severity: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-sm mt-4 text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/chat/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>

          <Snackbar
            open={alert.open}
            autoHideDuration={3000}
            onClose={() => setAlert({ ...alert, open: false })}
          >
            <Alert severity={alert.severity} sx={{ width: "100%" }}>
              {alert.message}
            </Alert>
          </Snackbar>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value.toLowerCase())}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotEmail("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <AiOutlineLoading3Quarters className="animate-spin mx-auto" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT: Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center rounded-l-3xl bg-green-50">
        <img src={illustration} alt="Illustration" className="max-w-md" />
      </div>
    </div>
  );
}
