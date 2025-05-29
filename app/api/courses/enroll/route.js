// // app/api/courses/enroll/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import Course from "@/models/Course";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongoDB();
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug session
    if (!session?.user?.id) {
      console.log('Unauthorized - No session user ID');
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { courseId } = await req.json(); // Correctly extracting courseId
    console.log('Received courseId:', courseId); // Debug input
    
    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log('Invalid course ID format:', courseId);
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize userCourses if it doesn't exist
    if (!user.userCourses) {
      user.userCourses = [];
      await user.save();
    }

    // Check if already enrolled (with safe array check)
    if ((user.userCourses || []).some(id => id.toString() === courseId)) {
      return NextResponse.json(
        { message: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Update both user and course in a transaction
    const mongoSession = await mongoose.startSession();
    await mongoSession.startTransaction();
    
    try {
      // Update user's courses
      await User.findByIdAndUpdate(
        session.user.id,
        { $addToSet: { userCourses: courseId } },
        { session: mongoSession, new: true }
      );
      
      // Update course student count
      await Course.findByIdAndUpdate(
        courseId,
        { $inc: { studentCount: 1 }, $push: { students: session.user.id } },
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      
      return NextResponse.json(
        { 
          message: "Successfully enrolled in course",
          courseId: courseId
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      console.error("Transaction error:", error);
      throw error;
    } finally {
      await mongoSession.endSession();
    }
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { 
        message: error.message || "Internal Server Error",
        error: error.toString() 
      },
      { status: 500 }
    );
  }
}