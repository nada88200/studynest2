//app\api\courses[id]\route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";
import mongoose from "mongoose";
 export async function GET(request, { params }) {
    try {
      await connectMongoDB();

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
          { error: 'Invalid course ID format' },
          { status: 400 }
        );
      }

      const course = await Course.findById(params.id).populate('author').populate('students', 'name email photo'); ;

      return new Response(JSON.stringify({ course }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }