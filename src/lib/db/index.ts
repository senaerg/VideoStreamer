'use server'
 
import 'server-only'

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your environment variables.");
}

export const connectToDatabase = async () => {
  if (mongoose?.connection?.readyState >= 1) return;
  try {
    console.log("Connecting to database")
    await mongoose.connect(MONGODB_URI, {
      dbName: "vistro-yt",
    });
    console.log("Connected to MongoDB");
  } catch (error: any) {
    console.log("MongoDB connection error:", error?.message);
  }
};
