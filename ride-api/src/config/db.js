import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Ride API: MongoDB connected");
  } catch (err) {
    console.error("Ride API: MongoDB connection failed", err);
    process.exit(1);
  }
};

export default connectDB;