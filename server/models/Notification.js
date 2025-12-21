import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["booking_request", "booking_status", "system", "chat_message"],
        required: true,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // To store Message ID
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // URL/Path to redirect to
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.model("Notification", NotificationSchema);
