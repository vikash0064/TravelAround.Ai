import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: false, // Optional if it's an image
    },
    type: {
        type: String,
        enum: ["text", "image"],
        default: "text",
    },
    imageUrl: {
        type: String,
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 } // TTL Index
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Message", MessageSchema);
