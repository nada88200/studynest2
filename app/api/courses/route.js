// app/api/courses/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/user";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";


export const dynamic = "force-dynamic";

// GET all courses
export async function GET() {
  await connectMongoDB();
  
  try {
    const courses = await Course.find()
      .populate('author', '_id name') // Properly populate author
      .lean(); // Convert to plain JS object

    return NextResponse.json({ courses }, { 
      headers: {
        'Cache-Control': 'no-store, max-age=0' 
      }
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST method to create a new course
export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
        const title = formData.get('title');

     // Check if a course with this title already exists
    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return NextResponse.json(
        { message: "A course with this title already exists" },
        { status: 400 }
      );
    }

    // Extract regular fields
    const courseData = {
      title: formData.get('title'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') || 0),
      lessons: parseInt(formData.get('lessons') || 0),
      description: formData.get('description'),
      author: session.user.id,
    };

    // Handle image file
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageResult = await uploadToCloudinary(buffer, {
          folder: 'course_images'
        });
        courseData.image = imageResult.url;
        courseData.imagePublicId = imageResult.public_id;
      } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json(
          { message: "Failed to upload course image" },
          { status: 500 }
        );
      }
    }

    // Handle slides/video files
    const files = formData.getAll('slidesVideoFiles');
    if (files.length > 0) {
      try {
        courseData.slidesVideoFiles = await Promise.all(
          files
            .filter(file => file.size > 0)
            .map(async (file) => {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const result = await uploadToCloudinary(buffer, {
                folder: 'course_files'
              });
              return {
                type: result.type,
                url: result.url,
                public_id: result.public_id
              };
            })
        );
      } catch (error) {
        console.error('Files upload error:', error);
        return NextResponse.json(
          { message: "Failed to upload course files" },
          { status: 500 }
        );
      }
    }

    // Create and save course
    const newCourse = new Course(courseData);
    await newCourse.save();

    // Update user's courses
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { userCourses: newCourse._id } }
    );

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    // Handle duplicate key error (in case the unique index is violated)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A course with this title already exists" },
        { status: 400 }
      );
    }
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE method - accessible to admin and course owner (tutor)
export async function DELETE(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Proper ObjectId comparison
    const isAdmin = session.user.role === "admin";
    const isOwner = course.author.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized to delete this course" }, 
        { status: 403 }
      );
    }

    // Delete associated files from Cloudinary
    try {
      if (course.imagePublicId) {
        await deleteFromCloudinary(course.imagePublicId);
      }
      
      if (course.slidesVideoFiles?.length > 0) {
        await Promise.all(
          course.slidesVideoFiles.map(file => 
            file.public_id ? deleteFromCloudinary(file.public_id) : Promise.resolve()
          )
        );
      }
    } catch (error) {
      console.error("Error deleting files from Cloudinary:", error);
      // Continue with course deletion even if file deletion fails
    }

    await Course.findByIdAndDelete(id);
    
    // Remove from all users' courses
    await User.updateMany(
      { userCourses: id },
      { $pull: { userCourses: id } }
    );

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}