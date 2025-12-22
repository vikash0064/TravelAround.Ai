import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const router = express.Router();

// SANITY CHECK
router.get("/test-db", async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ status: "ok", userCount: count, dbState: mongoose.connection.readyState });
    } catch (err) {
        res.status(500).json({ status: "error", error: err.message });
    }
});

// CHECK SESSION (Get Current User)
router.get("/me", async (req, res) => {
    if (req.session && req.session.user) {
        // Optional: Re-fetch from DB to get latest status if needed
        // For performance, we can return session data, but if role/verification can change, fetch fresh.
        try {
            const user = await User.findById(req.session.user.id).select("-password");
            if (!user) {
                req.session.destroy();
                return res.status(401).json({ message: "User not found" });
            }
            // Update session with latest info
            req.session.user = {
                id: user._id,
                role: user.role,
                isVerified: user.isVerified
            };
            return res.status(200).json({ user: { id: user._id, username: user.username, role: user.role, isVerified: user.isVerified } });
        } catch (err) {
            return res.status(500).json({ message: "Server Error" });
        }
    } else {
        return res.status(401).json({ message: "Not authenticated" });
    }
});

// REGISTER
router.post("/register", async (req, res) => {
    console.log("[AUTH_REGISTER] Body:", req.body);
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Registration data is missing" });
        }
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();

        // Check if user exists
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) return res.status(400).json({ message: "Email already registered" });

        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) return res.status(400).json({ message: "Username already taken" });

        // Hash password
        console.log("[AUTH_REGISTER] Hashing password for", normalizedEmail);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        console.log("[AUTH_REGISTER] Creating user model for", normalizedEmail);
        const newUser = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            role: role || 'user'
        });

        console.log("[AUTH_REGISTER] Saving user to DB...");
        const savedUser = await newUser.save();
        console.log("[AUTH_REGISTER] User saved successfully with ID:", savedUser._id);

        // No auto-login because admin approval might be required.
        res.status(201).json({
            message: "User registered successfully. Please wait for admin approval.",
        });

    } catch (err) {
        console.error("[AUTH_REGISTER_ERROR]:", err.message);
        console.error(err.stack);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(err.errors).map(val => val.message).join(', ') });
        }
        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
        }
        res.status(500).json({
            message: err.message || "Internal server error during registration",
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check user
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`[AUTH_LOGIN] Failure: User ${normalizedEmail} not found`);
            return res.status(400).json({ message: "[AUTH] User not found. Please register first." });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

        // Check verification status
        // if (!user.isVerified && user.role !== "admin") {
        //    return res.status(403).json({ message: "Account pending approval from admin." });
        // }

        // Create Session
        console.log(`[AUTH_LOGIN] Creating session for user: ${user.username}`);
        req.session.user = {
            id: user._id,
            role: user.role,
            isVerified: user.isVerified
        };

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, role: user.role, isVerified: user.isVerified }
        });

    } catch (err) {
        console.error("[AUTH_LOGIN_ERROR]:", err);
        res.status(500).json({ message: err.message });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Could not log out" });
        }
        res.clearCookie("connect.sid"); // Clear cookie on client
        res.status(200).json({ message: "Logout successful" });
    });
});

export default router;
