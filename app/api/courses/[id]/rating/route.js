//app\api\courses\[id]\rating\route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";
import mongoose from "mongoose";

export async function POST(request, { params }) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = params;
  const { rating } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Invalid rating (must be 1-5)' },
      { status: 400 }
    );
  }

  try {
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Initialize ratings array if it doesn't exist
    if (!course.ratings) {
      course.ratings = [];
    }

    // Check if user is enrolled
    const isEnrolled = course.students?.some(student => 
      student.toString() === session.user.id
    );
    
    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'You must be enrolled to rate this course' },
        { status: 403 }
      );
    }

    // Check if user already rated
    const existingRatingIndex = course.ratings.findIndex(r => 
      r.user.toString() === session.user.id
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      course.ratings.push({
        user: new mongoose.Types.ObjectId(session.user.id),
        rating
      });
    }

    // Calculate new average
    const totalRatings = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = totalRatings / course.ratings.length;
    course.reviewNumber = course.ratings.length;

    await course.save();

    return NextResponse.json({ 
      success: true,
      averageRating: course.averageRating,
      reviewNumber: course.reviewNumber
    }, { status: 200 });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}