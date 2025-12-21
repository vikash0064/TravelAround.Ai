import express from "express";
import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL USERS (Admin only)
router.get("/", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APPROVE USER
router.patch("/:id/verify", verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "[USERS] User not found" });

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "User verified successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REVOKE USER ACCESS
router.patch("/:id/revoke", verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "[USERS] User not found" });

        user.isVerified = false;
        await user.save();

        res.status(200).json({ message: "User access revoked", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER
router.delete("/:id", verifyAdmin, async (req, res) => {
    const userId = req.params.id;
    console.log(`[DELETE_USER] Admin ${req.user.id} requested deletion of user ${userId}`);

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`[DELETE_USER] User ${userId} not found`);
            return res.status(404).json({ message: "[USERS] User not found" });
        }

        // 1. Get all trips by this user to clean up favorites
        const userTrips = await Trip.find({ userId: userId }).select('_id');
        const userTripIds = userTrips.map(t => t._id);

        // 2. Cascade delete trips
        const tripDel = await Trip.deleteMany({ userId: userId });
        console.log(`[DELETE_USER] Deleted ${tripDel.deletedCount} trips owned by ${userId}`);

        // 3. Cascade delete bookings (both made BY the user and FOR the user's trips)
        const bookingDel = await Booking.deleteMany({
            $or: [
                { userId: userId },
                { tripId: { $in: userTripIds } }
            ]
        });
        console.log(`[DELETE_USER] Deleted ${bookingDel.deletedCount} bookings related to ${userId}`);

        // 4. Cascade delete messages (sent by the user)
        const msgDel = await Message.deleteMany({
            $or: [
                { userId: userId },
                { tripId: { $in: userTripIds } }
            ]
        });
        console.log(`[DELETE_USER] Deleted ${msgDel.deletedCount} messages related to ${userId}`);

        // 5. Cascade delete notifications
        const notifDel = await Notification.deleteMany({ userId: userId });
        console.log(`[DELETE_USER] Deleted ${notifDel.deletedCount} notifications for ${userId}`);

        // 6. Cleanup favorites in other users
        if (userTripIds.length > 0) {
            await User.updateMany({}, { $pull: { favorites: { $in: userTripIds } } });
        }

        // 7. Finally delete the user
        await User.findByIdAndDelete(userId);
        console.log(`[DELETE_USER] User ${userId} (${user.username}) deleted successfully`);

        res.status(200).json({ message: "User and all associated data deleted successfully" });
    } catch (err) {
        console.error("[DELETE_USER] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PROFILE
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { bio, phone, avatar, username } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "[USERS] User not found" });

        // Update fields
        if (bio !== undefined) user.bio = bio;
        if (phone !== undefined) user.phone = phone;
        if (avatar !== undefined) user.avatar = avatar;
        if (username !== undefined) user.username = username;

        await user.save();

        // Return updated user info without password
        const { password, ...userInfo } = user._doc;
        res.json(userInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET PROFILE
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "[USERS] User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CHANGE PASSWORD
router.put("/change-password", verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "[USERS] User not found" });

        // Verify current password
        const bcrypt = await import("bcryptjs"); // Dynamic import to avoid top-level if not present
        const isMatch = await bcrypt.default.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

        // Hash new password
        const salt = await bcrypt.default.genSalt(10);
        user.password = await bcrypt.default.hash(newPassword, salt);

        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TOGGLE FAVORITE TRIP
router.post("/favorites/:tripId", verifyToken, async (req, res) => {
    try {
        const { tripId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "[USERS] User not found" });

        const index = user.favorites.indexOf(tripId);
        if (index > -1) {
            user.favorites.splice(index, 1); // Remove if exists
        } else {
            user.favorites.push(tripId); // Add if doesn't
        }

        await user.save();
        res.json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
