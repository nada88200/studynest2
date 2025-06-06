//app\api\courses\[id]\route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteFromCloudinary } from "@/lib/cloudinary";

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
export async function PUT(request, { params }) {
  try {
    await connectMongoDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is the course author or admin
    if (course.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to edit this course' },
        { status: 403 }
      );
    }

    let updateData;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle form data (for file uploads)
      const formData = await request.formData();
      updateData = {
        title: formData.get('title'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price') || 0),
        lessons: parseInt(formData.get('lessons') || 0),
        description: formData.get('description'),
      };
      
      // Handle file uploads if any
      const files = formData.getAll('files');
      if (files.length > 0) {
        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            const result = await uploadToCloudinary(file);
            return {
              type: result.type,
              url: result.url
            };
          })
        );
        updateData.slidesVideoFiles = [...course.slidesVideoFiles, ...uploadedFiles];
      }
    } else {
      // Handle JSON data
      updateData = await request.json();
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ course: updatedCourse }, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}