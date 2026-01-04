import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN!);
    console.log("DB Online");
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

export default dbConnection;
