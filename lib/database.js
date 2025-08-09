import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
}

// Global cache to maintain a single connection in development
const globalCache = global.__mongoose || (global.__mongoose = { conn: null, promise: null });

async function connectDB() {
    if (globalCache.conn) return globalCache.conn; // Return cached connection if available

    try {
        if (!globalCache.promise) {
            globalCache.promise = mongoose.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                bufferCommands: false, // Disable Mongoose buffering
            });
        }

        globalCache.conn = await globalCache.promise;
        console.log("Connected to MongoDB successfully");
        return globalCache.conn;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("MongoDB connection failed");
    }
}

export default connectDB;
