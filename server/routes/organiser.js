import express from "express";
import Trip from "../models/Trip.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { verifyOrganiser } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ORGANISER TRIPS
router.get("/my-managed-trips", verifyOrganiser, async (req, res) => {
    try {
        const trips = await Trip.find({
            userId: req.user.id,
            organiserStatus: "approved"
        }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET JOIN REQUESTS FOR ORGANISER
router.get("/join-requests", verifyOrganiser, async (req, res) => {
    try {
        const myTrips = await Trip.find({ userId: req.user.id }).select('_id');
        const tripIds = myTrips.map(t => t._id);

        const requests = await Booking.find({ tripId: { $in: tripIds } })
            .populate('userId', 'username email avatar')
            .populate('tripId', 'destination organiserStatus')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APPROVE/REJECT JOIN REQUEST (BY ORGANISER)
router.put("/requests/:id/validate", verifyOrganiser, async (req, res) => {
    try {
        const { status } = req.body; // approved, rejected
        const booking = await Booking.findById(req.params.id).populate('tripId');

        if (!booking) return res.status(404).json({ message: "Request not found" });

        // Security check: Does this booking belong to a trip owned by the current user?
        if (booking.tripId.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You don't own this trip" });
        }

        booking.status = status;
        await booking.save();

        // Notify User
        const io = req.app.get('io');
        const notif = new Notification({
            userId: booking.userId,
            type: "booking_status",
            message: `Your request to join the trip to ${booking.destination} has been ${status} by the organiser`,
            link: `/view-trip/${booking.tripId._id}`
        });
        await notif.save();
        if (io) io.to(`user_${booking.userId}`).emit("notification_new", notif);

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
