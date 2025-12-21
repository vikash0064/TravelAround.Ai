import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/travel-around";

console.log("Testing connection to:", uri);

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: MongoDB is running and reachable!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAILURE: Could not connect to MongoDB.");
        console.error("Error details:", err.message);
        process.exit(1);
    });
