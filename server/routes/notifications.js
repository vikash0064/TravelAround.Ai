import express from "express";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Notifications for User
router.get("/", verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as Read
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        // TRIGGER AUTO-DELETE: 24h timer
        if (notification && notification.type === 'chat_message' && notification.relatedId) {
            await Message.findByIdAndUpdate(notification.relatedId, {
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            });
        }

        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark ALL as Read
router.put("/mark-all-read", verifyToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
