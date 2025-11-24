// Chat;
import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { requestNotificationPermission, notifyNewMessage } from "../utils/notifications";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { IconButton, Snackbar, Alert } from "@mui/material";
import { getErrorMessage } from "../utils/error";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

dayjs.extend(relativeTime);

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const getAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff`;

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [pendingMessages, setPendingMessages] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socket = useRef();
  const messagesEndRef = useRef();
  const chatContainerRef = useRef();
  const usersRef = useRef(users);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Socket.IO
  useEffect(() => {
    if (!currentUser) return;
    // ensure notifications permission requested once
    requestNotificationPermission().catch(() => {});

    socket.current = io(API_BASE_URL);
    socket.current.emit("join_room", currentUser._id);

    socket.current.on("get_online_users", setOnlineUsers);

    socket.current.on("receive_message", (msg) => {
      if (
        activeChat?._id === msg.senderId ||
        activeChat?._id === msg.receiverId
      ) {
        setMessages((prev) => [...prev, msg]);
        const chatDiv = chatContainerRef.current;
        if (
          msg.senderId !== currentUser._id &&
          chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight > 50
        ) {
          setPendingMessages((prev) => prev + 1);
        } else {
          setTimeout(() => {
            chatDiv.scrollTo({ top: chatDiv.scrollHeight, behavior: "smooth" });
            setPendingMessages(0);
          }, 50);
        }
      } else if (msg.senderId !== currentUser._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.senderId]: prev[msg.senderId] ? prev[msg.senderId] + 1 : 1,
        }));
        // Show system notification for incoming message from others
        // Only show when permission granted. If user is not focused or not currently
        // viewing the same chat, show a notification.
        try {
          const shouldNotify = document.hidden || activeChat?._id !== msg.senderId;
          if (shouldNotify) {
            // Prefer the local users list for sender name (fetched from backend).
            const sender = usersRef.current.find((u) => u._id === msg.senderId) || null;
            const senderName = sender?.fullName || msg.senderName || "New message";
            notifyNewMessage({ senderName, content: msg.content, senderId: msg.senderId });
          }
        } catch {
          // ignore notification errors
        }
      }
    });

    return () => socket.current.disconnect();
  }, [currentUser, activeChat]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data.filter((u) => u._id !== currentUser._id));
    } catch (err) {
      const msg = getErrorMessage(err);
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const selectChat = async (user) => {
    setActiveChat(user);
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
    setPendingMessages(0);
    setSidebarOpen(false);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/messages/${currentUser._id}/${user._id}`
      );
      setMessages(res.data);
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    } catch (err) {
      const msg = getErrorMessage(err);
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const msg = {
      senderId: currentUser._id,
      receiverId: activeChat._id,
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    try {
      await axios.post(`${API_BASE_URL}/api/messages`, msg);
      setNewMessage("");
      setPendingMessages(0);
    } catch (err) {
      const msg = getErrorMessage(err);
      setAlert({ open: true, message: msg, severity: "error" });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!activeChat) return;

    socket.current.emit("typing", {
      senderId: currentUser._id,
      receiverId: activeChat._id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("typing", {
        senderId: currentUser._id,
        receiverId: activeChat._id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.location.reload();
  };

  const goBackToList = () => {
    setActiveChat(null);
  };

  const renderDateSeparator = (currentMsg, index) => {
    if (index === 0) return true;
    const prevMsgDate = dayjs(messages[index - 1].timestamp).format(
      "YYYY-MM-DD"
    );
    const currMsgDate = dayjs(currentMsg.timestamp).format("YYYY-MM-DD");
    return prevMsgDate !== currMsgDate;
  };

  const formatDateLabel = (timestamp) => {
    const msgDay = dayjs(timestamp);
    if (msgDay.isSame(dayjs(), "day")) return "Today";
    if (msgDay.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
    return msgDay.format("DD MMM YYYY");
  };

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setPendingMessages(0);
  };

  if (!currentUser) return <Navigate to="/chat/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween" }}
            className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col justify-between"
          >
            <div className="p-4 border-b flex justify-between items-center h-16">
              <span className="text-lg font-semibold">Menu</span>
              <IconButton onClick={() => setSidebarOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* any additional menu items can go here */}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-1/4 bg-white shadow-md flex-col">
        <div className="p-4 border-b flex justify-between items-center h-16">
          <h2 className="text-lg font-semibold">Users</h2>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {users.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const unread = unreadCounts[user._id] || 0;
            return (
              <div
                key={user._id}
                onClick={() => selectChat(user)}
                className="flex items-center justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(user.fullName)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span>{user.fullName}</span>
                    <span
                      className={`text-xs ${
                        isOnline ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative md:ml-0">
        {/* Mobile Topbar */}
        <div className="md:hidden p-4 bg-white border-b shadow-sm flex items-center justify-between h-16 sticky top-0 z-10">
          {activeChat ? (
            <IconButton onClick={goBackToList}>
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <span className="text-lg font-semibold truncate">
            {activeChat ? activeChat.fullName : "Chats"}
          </span>
          <div className="w-6" />
        </div>

        {/* User list for mobile */}
        {!activeChat && (
          <div className="flex-1 overflow-y-auto p-1 hide-scrollbar gap-2 md:hidden">
            {users.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const unread = unreadCounts[user._id] || 0;
              return (
                <div
                  key={user._id}
                  onClick={() => selectChat(user)}
                  className="flex flex-row gap-4 items-center bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg mb-1"
                >
                  <img
                    src={getAvatarUrl(user.fullName)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-semibold">{user.fullName}</span>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mt-1">
                      {unread}
                    </span>
                  )}
                  <span
                    className={`text-xs ml-auto ${
                      isOnline ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat window */}
        {activeChat && (
          <>
            <div className="md:flex p-4 bg-white border-b shadow-sm flex items-center gap-3 sticky top-0 z-10 h-16">
              <IconButton onClick={goBackToList}>
                <ArrowBackIcon />
              </IconButton>
              <img
                src={getAvatarUrl(activeChat.fullName)}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <h3 className="text-lg font-semibold">{activeChat.fullName}</h3>
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto hide-scrollbar bg-gray-50"
              ref={chatContainerRef}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <React.Fragment key={idx}>
                    {renderDateSeparator(msg, idx) && (
                      <div className="flex justify-center my-2">
                        <span className="px-3 py-1 bg-gray-300 rounded-full text-xs text-gray-700">
                          {formatDateLabel(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-end mb-2 ${
                        msg.senderId === currentUser._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 rounded-2xl max-w-md shadow-md ${
                          msg.senderId === currentUser._id
                            ? "bg-green-100 text-gray-800"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div className="text-xs text-gray-400 text-right mt-1">
                          {dayjs(msg.timestamp).format("HH:mm")}
                        </div>
                      </motion.div>
                    </motion.div>
                  </React.Fragment>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white flex items-center gap-2 border-t sticky bottom-0">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <motion.button
                onClick={sendMessage}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05, backgroundColor: "#16a34a" }}
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
              >
                Send
              </motion.button>
            </div>
          </>
        )}
      </div>
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Chat;
