import express from "express";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import { verifyAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();



// CREATE TRIP
router.post("/", verifyToken, async (req, res) => {
    try {
        const { tripData, destination, duration, budget, capacity, price, requestOrganiser } = req.body;

        const newTrip = new Trip({
            userId: req.user.id,
            tripData,
            destination,
            duration,
            budget,
            capacity: capacity || 10,
            price,
            status: "pending",
            requestOrganiser: requestOrganiser || false
        });

        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER TRIPS
router.get("/user-trips", verifyToken, async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL APPROVED TRIPS (SEARCH/FILTER) - Public
router.get("/", async (req, res) => {
    try {
        const { query, minDays, maxDays, budget } = req.query;
        let filter = { isPublic: true, status: "approved" }; // Only approved trips

        if (query) {
            filter.destination = { $regex: query, $options: "i" };
        }
        if (minDays || maxDays) {
            filter.duration = {};
            if (minDays) filter.duration.$gte = Number(minDays);
            if (maxDays) filter.duration.$lte = Number(maxDays);
        }
        if (budget) {
            filter.budget = budget;
        }

        const trips = await Trip.find(filter).sort({ createdAt: -1 });
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET PENDING TRIPS (ADMIN ONLY)
router.get("/admin/all", verifyAdmin, async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 }).populate('userId', 'username email');
        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE TRIP STATUS (ADMIN ONLY)
router.patch("/:id/status", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body; // approved, rejected
        const trip = await Trip.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE ORGANISER STATUS (ADMIN ONLY)
router.patch("/:id/organiser-status", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body; // approved, rejected
        const trip = await Trip.findByIdAndUpdate(req.params.id, { organiserStatus: status }, { new: true });

        if (status === 'approved') {
            // Also update user role to 'organiser'
            await User.findByIdAndUpdate(trip.userId, { role: 'organiser' });
        }

        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET TRIP BY ID (PUBLIC/SHARED)
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId to prevent 500 CastError
    if (!id || id.length < 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
        console.warn(`[GET_TRIP] Invalid ID format received: ${id}`);
        return res.status(400).json({ message: "Invalid trip ID format" });
    }

    try {
        const trip = await Trip.findById(id);
        if (!trip) {
            console.warn(`[GET_TRIP] Trip ${id} not found`);
            return res.status(404).json({ message: "Trip not found" });
        }

        res.status(200).json(trip);
    } catch (err) {
        console.error(`[GET_TRIP] Server Error for ID ${id}:`, err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// DELETE TRIP (ADMIN OR OWNER)
router.delete("/:id", verifyToken, async (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`[DELETE_TRIP] Request for ID: ${tripId} by User: ${userId} (${userRole})`);

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) {
            console.warn(`[DELETE_TRIP] Trip ${tripId} not found`);
            return res.status(404).json({ message: "Trip not found" });
        }

        // Check permissions: Admin or Owner
        const isOwner = trip.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAdmin && !isOwner) {
            console.warn(`[DELETE_TRIP] Unauthorized attempt on ${tripId} by ${userId}`);
            return res.status(403).json({ message: "Unauthorized: You don't own this trip and are not an admin" });
        }

        // Perform deletion
        await Trip.findByIdAndDelete(tripId);
        console.log(`[DELETE_TRIP] Trip ${tripId} deleted from MongoDB`);

        // Cascade delete: Remove all bookings for this trip
        const bookingDeleteResult = await Booking.deleteMany({ tripId: tripId });
        console.log(`[DELETE_TRIP] Cascade deleted ${bookingDeleteResult.deletedCount} bookings`);

        // Cascade delete: Remove all messages for this trip
        const messageDeleteResult = await Message.deleteMany({ tripId: tripId });
        console.log(`[DELETE_TRIP] Cascade deleted ${messageDeleteResult.deletedCount} messages`);

        // Cleanup: Remove from all users' favorites
        await User.updateMany({}, { $pull: { favorites: tripId } });

        res.status(200).json({
            message: "Trip and its bookings deleted successfully",
            deletedId: tripId,
            bookingsRemoved: bookingDeleteResult.deletedCount
        });
    } catch (err) {
        console.error("[DELETE_TRIP] Server Error:", err);
        res.status(500).json({ error: "Server error during deletion", details: err.message });
    }
});

export default router;
