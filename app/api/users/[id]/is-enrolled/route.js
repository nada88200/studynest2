//app\api\users[id]\is-enrolled\route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";

export async function GET(request, { params }) {
    try {
      await connectMongoDB();

      const { searchParams } = new URL(request.url);
      const courseId = searchParams.get('courseId');

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return NextResponse.json(
          { error: 'Invalid course ID' },
          { status: 400 }
        );
      }

      const user = await User.findById(params.id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const isEnrolled = (user.userCourses || []).some(id => id.toString() === courseId);
      console.log('Is already enrolled:', isEnrolled);

      return NextResponse.json({ isEnrolled });
    } catch (error) {
      console.error("Enrollment check error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }