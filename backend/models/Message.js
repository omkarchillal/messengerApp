// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true }, // Firebase UID
    receiverId: { type: String, required: true }, // Firebase UID
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

// Compound index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
