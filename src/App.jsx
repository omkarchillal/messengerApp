import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Chat from "./Components/chat.jsx";
import ChatLogin from "./Components/ChatLogin.jsx";
import ChatSignup from "./Components/ChatSignup.jsx";
import ResetPassword from "./Components/ResetPassword.jsx";
import "./App.css";

/* ✅ Protected Route for Chat */
function ChatPrivateRoute({ children }) {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ============================
            💬 Chat Routes
        ============================ */}
        <Route
          path="/"
          element={
            <ChatPrivateRoute>
              <Chat />
            </ChatPrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ChatPrivateRoute>
              <Chat />
            </ChatPrivateRoute>
          }
        />
        <Route path="/chat/login" element={<ChatLogin />} />
        <Route path="/chat/signup" element={<ChatSignup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<ChatLogin />} />
        <Route path="/signup" element={<ChatSignup />} />

        {/* ============================
            🚧 404 Page
        ============================ */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-xl">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
