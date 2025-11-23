// Components/ChatSignup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdRemoveRedEye, MdArrowBack } from "react-icons/md";
import { AiFillEyeInvisible, AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { Fab, Box, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import illustration from "../assets/data-analysis-case-study.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE;

export default function ChatSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);

      // 1. Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // 2. Sync to MongoDB via backend
      const res = await axios.post(`${API_BASE_URL}/api/auth/sync`, {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || "User",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        provider: "google",
      });

      // 3. Save user info to localStorage
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
      localStorage.setItem("token", await firebaseUser.getIdToken());

      setAlert({
        open: true,
        message: "Google signup successful!",
        severity: "success",
      });

      setTimeout(() => navigate("/chat"), 1500);
    } catch (err) {
      setAlert({
        open: true,
        message:
          err.response?.data?.message || err.message || "Google signup failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({
        open: true,
        message: "Passwords do not match!",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Sync to MongoDB via backend
      const res = await axios.post(`${API_BASE_URL}/api/auth/sync`, {
        uid: firebaseUser.uid,
        fullName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        provider: "password",
      });

      // 3. Save user info to localStorage
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          _id: res.data.user._id,
          uid: firebaseUser.uid,
          fullName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        })
      );
      localStorage.setItem("token", await firebaseUser.getIdToken());

      setAlert({
        open: true,
        message: "Signup successful!",
        severity: "success",
      });

      setTimeout(() => navigate("/chat"), 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: err.response?.data?.message || err.message || "Signup failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-6">
        <Box
          sx={{ position: "fixed", top: "2rem", left: "2rem", zIndex: 1000 }}
        >
          <Fab
            onClick={() => navigate("/")}
            variant="extended"
            sx={{ backgroundColor: "#26282A", color: "#fff" }}
          >
            <MdArrowBack style={{ marginRight: "0.5rem" }} /> Back
          </Fab>
        </Box>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900">
              AppNexus
            </h1>
            <p className="text-gray-500 text-center mb-8 text-sm md:text-base">
              Create your account to get started
            </p>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <MdRemoveRedEye size={20} />
                    ) : (
                      <AiFillEyeInvisible size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <MdRemoveRedEye size={20} />
                    ) : (
                      <AiFillEyeInvisible size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin mx-auto text-lg" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-400 text-xs">
                or continue with
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/chat/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Illustration (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <img
          src={illustration}
          alt="Sign up illustration"
          className="max-w-sm object-contain"
        />
      </div>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
