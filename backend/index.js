//index.js - AppNexus Chat Backend with Firebase Auth
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Message from "./models/Message.js";
import connectDB from "./config/db.js";

dotenv.config();

// Log environment configuration
console.log('🔧 Environment check:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ MISSING');
console.log('');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// ---------------- Middleware ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true,
    credentials: true
}));

// Root health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AppNexus Chat Backend API is running',
        auth: 'Firebase Authentication',
        database: 'MongoDB',
        endpoints: {
            health: '/',
            auth: '/api/auth',
            messages: '/api/messages',
            users: '/api/users'
        }
    });
});

// Make io available to routes for server-side emits
app.set("io", io);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Global error handler - ensure JSON responses for errors
app.use((err, req, res, next) => {
    console.error('🔥 Unhandled server error:', err);
    const status = err.status || 500;
    const payload = {
        message: err.message || 'Internal server error',
    };
    if (process.env.NODE_ENV !== 'production') {
        payload.stack = err.stack;
    }
    res.status(status).json(payload);
});

// ---------------- Socket.IO Handling ----------------

// Use Map for cleaner online user management
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // When user joins their room
    socket.on("join_room", (userId) => {
        socket.join(userId);
        onlineUsers.set(userId, socket.id);
        console.log(`✅ User ${userId} joined their room`);

        // Broadcast updated online users list
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    // When a user is typing
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing_status", { senderId, isTyping });
        }
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
        const { senderId, receiverId, content } = data;

        try {
            // Save message to MongoDB
            const newMessage = new Message({ senderId, receiverId, content });
            await newMessage.save();

            // Emit message to receiver if online
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive_message", data);
            }

            // Emit back to sender to update sender chat too
            const senderSocketId = onlineUsers.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("receive_message", data);
            }

        } catch (err) {
            console.error("❌ Error saving message:", err);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);

        // Remove user from online users
        for (let [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }

        // Broadcast updated online users list
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 AppNexus Chat Server running on port ${PORT}`));
