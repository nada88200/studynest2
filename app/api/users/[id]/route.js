//app\api\users[id]\route.js 
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

/// app/api/users/[id]/route.js
export async function GET(request, { params }) {
    try {
      await connectMongoDB();
      const user = await User.findById(params.id)
        .populate('userCourses') // This populates the course data
        .select('-password');

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ user });
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }