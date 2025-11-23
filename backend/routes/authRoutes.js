// routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * 📝 Sign up - Create a new user
 * POST /api/auth/signup
 * Body: { fullName, email, password }
 */
router.post("/signup", async (req, res) => {
    console.log("📝 Received signup request:", req.body);

    try {
        const { fullName, email, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ 
                message: "Full name, email, and password are required" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "User with this email already exists" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user without uid (for email/password auth)
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            provider: "password",
            // Do not set uid - let it be undefined/null
        });

        await user.save();
        console.log(`✅ User created successfully: ${email}`);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({ 
            message: "Signup successful",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("❌ Error during signup:", error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `A user with this ${field} already exists` 
            });
        }
        
        res.status(500).json({ 
            message: "Error during signup", 
            error: error.message 
        });
    }
});

/**
 * 🔐 Login - Authenticate user
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
    console.log("🔐 Received login request:", req.body.email);

    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: "Invalid email or password" 
            });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                message: "Invalid email or password" 
            });
        }

        // Update last seen
        user.lastSeen = new Date();
        await user.save();

        console.log(`✅ User logged in successfully: ${email}`);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ 
            message: "Login successful",
            user: userWithoutPassword,
            token: "jwt-token-placeholder" // In production, generate real JWT
        });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ 
            message: "Error during login", 
            error: error.message 
        });
    }
});

/**
 * 🔑 Sync user from Firebase to MongoDB
 * POST /api/auth/sync
 * Body: { uid, fullName, email, photoURL?, provider? }
 */
router.post("/sync", async (req, res) => {
    console.log("📥 Received sync request:", req.body);

    try {
        const { uid, fullName, email, photoURL, provider } = req.body;

        if (!uid || !email) {
            console.log("⚠️ Missing UID or email");
            return res.status(400).json({ error: "Missing uid or email" });
        }

        // Check if user exists
        let user = await User.findOne({ uid });

        if (user) {
            // Update existing user
            console.log(`⚙️ Updating existing user: ${email}`);
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.photoURL = photoURL || user.photoURL;
            user.provider = provider || user.provider;
            user.lastSeen = new Date();
            await user.save();

            console.log(`✅ User updated: ${email}`);
            return res.status(200).json({ message: "User updated", user });
        }

        // Create new user
        user = new User({
            uid,
            fullName,
            email,
            photoURL: photoURL || null,
            provider: provider || "password",
        });

        await user.save();
        console.log(`✅ User synced successfully: ${email}`);

        res.status(201).json({ message: "User created", user });
    } catch (error) {
        console.error("❌ Error syncing user:", error);
        res.status(500).json({ message: "Error syncing user", error: error.message });
    }
});

/**
 * 🩺 Health check
 */
router.get("/ping", (req, res) => {
    res.json({ message: "Auth API is running 🚀" });
});

export default router;
