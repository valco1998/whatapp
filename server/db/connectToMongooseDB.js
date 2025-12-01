import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO_URL from env:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
