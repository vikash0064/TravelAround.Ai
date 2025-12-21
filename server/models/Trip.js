import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    tripData: {
        type: Object, // Stores the entire JSON object from AI
        required: true,
    },
    duration: {
        type: Number,
        required: false,
    },
    budget: {
        type: String,
        required: false,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    capacity: {
        type: Number,
        default: 10,
    },
    price: {
        type: Number,
        required: false,
    },
    requestOrganiser: {
        type: Boolean,
        default: false,
    },
    organiserStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

export default mongoose.model("Trip", TripSchema);
