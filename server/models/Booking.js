import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    destination: {
        type: String, // Can be used to group bookings by destination name
        required: true,
    },
    tripId: {
        // Optional: if linked to a specific generated trip
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip"
    },
    hotelId: {
        type: String
    },
    hotelName: { type: String },
    hotelImage: { type: String },
    hotelAddress: { type: String },
    price: { type: String },
    userName: { type: String },
    userEmail: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "revoked"],
        default: "pending",
    },
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
