import mongoose from "mongoose";
import "dotenv/config";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGOBD_URL);
    console.log("Connected to MongoDB Atlas successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  }
};

connect();
