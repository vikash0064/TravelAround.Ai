import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "organiser", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false, // Admin needs to verify
    },
    bio: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    avatar: {
        type: String,
        default: "", // URL to image
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip"
    }]
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
