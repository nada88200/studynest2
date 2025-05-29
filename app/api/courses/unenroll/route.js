// app/api/courses/unenroll/route.js
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { courseId } = await req.json();
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if actually enrolled
    if (!(user.userCourses || []).some(id => id.toString() === courseId)) {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 400 }
      );
    }

    // Transaction for unenrollment
    const mongoSession = await mongoose.startSession();
    await mongoSession.startTransaction();
    
    try {
      // Remove from user's courses
      await User.findByIdAndUpdate(
        session.user.id,
        { $pull: { userCourses: courseId } },
        { session: mongoSession, new: true }
      );
      
      // Update course student count
      await Course.findByIdAndUpdate(
        courseId,
        { 
          $inc: { studentCount: -1 }, 
          $pull: { students: session.user.id } 
        },
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      
      return NextResponse.json(
        { 
          message: "Successfully unenrolled from course",
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
    console.error("Unenrollment error:", error);
    return NextResponse.json(
      { 
        message: error.message || "Internal Server Error",
        error: error.toString() 
      },
      { status: 500 }
    );
  }
}