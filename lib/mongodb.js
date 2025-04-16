import mongoose from "mongoose";

export const connectMongoDB = async () => {

    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    }
    catch(error){
        console.log("An error occurred while connecting to MongoDB", error);
    }
}