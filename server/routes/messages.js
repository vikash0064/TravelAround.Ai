import express from "express";
import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import Trip from "../models/Trip.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Messages for a Trip
router.get("/:tripId", verifyToken, async (req, res) => {
    try {
        const { tripId } = req.params;

        // Validate ObjectId
        if (!tripId || tripId.length < 24 || !/^[0-9a-fA-F]{24}$/.test(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }

        // Check if user is approved member, creator, OR is admin
        const isApprovedMember = await Booking.findOne({
            tripId,
            userId: req.user.id,
            status: "approved"
        });

        const trip = await Trip.findById(tripId);
        const isCreator = trip && trip.userId.toString() === req.user.id;

        if (!isApprovedMember && !isCreator && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not an approved member of this trip." });
        }

        const messages = await Message.find({ tripId })
            .sort({ createdAt: 1 }); // Oldest first
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
