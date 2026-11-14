import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoBD Connected...");
  } catch (err) {
    console.log("MongoDB Connection Failed");
  }
};

export default connectDB;
