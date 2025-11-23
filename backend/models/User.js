// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        uid: { 
            type: String, 
            unique: true, 
            sparse: true // This allows multiple null values
        },
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, default: null }, // For email/password signup
        photoURL: { type: String, default: null },
        provider: { type: String, default: "password" }, // 'password', 'google', etc.
        online: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
