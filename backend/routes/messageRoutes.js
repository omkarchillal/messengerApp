// routes/messageRoutes.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/**
 * 📩 Get messages between two users
 * GET /api/messages/:senderId/:receiverId
 */
router.get("/:senderId/:receiverId", async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before ? new Date(req.query.before) : new Date();

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
            timestamp: { $lt: before },
        })
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json(messages.reverse()); // oldest to newest
    } catch (err) {
        console.error("❌ Error fetching messages:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * ✉️ Send a new message
 * POST /api/messages
 */
router.post("/", async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const msg = await Message.create({
            senderId,
            receiverId,
            content,
        });

        // Emit the saved message to the receiver and sender via Socket.IO
        try {
            const io = req.app.get("io");
            if (io) {
                io.to(receiverId).emit("receive_message", msg);
                io.to(senderId).emit("receive_message", msg);
            }
        } catch (emitErr) {
            console.error("❌ Error emitting message via Socket.IO:", emitErr);
        }

        res.json(msg);
    } catch (err) {
        console.error("❌ Error sending message:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
