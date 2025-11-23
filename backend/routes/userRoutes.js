// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * 👥 Get all users
 * GET /api/users
 */
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password -__v");
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

/**
 * 👤 Get user by ID (MongoDB _id)
 * GET /api/users/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try to find by MongoDB _id first, then by uid
        let user = await User.findById(id).select("-password -__v");
        
        if (!user) {
            user = await User.findOne({ uid: id }).select("-password -__v");
        }
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
