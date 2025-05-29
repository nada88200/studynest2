//app\api\courses\route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/user";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Updated route config (new Next.js 13+ syntax)
export const dynamic = "force-dynamic";

// GET method to fetch user's courses and files
// GET all courses (not just user-specific)
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
    
    // Extract regular fields
    const courseData = {
        title: formData.get('title'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price') || 0),
        lessons: parseInt(formData.get('lessons') || 0),
        author: session.user.id,
      };
    // Handle image file
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      const imageResult = await uploadToCloudinary(imageFile);
      courseData.image = imageResult.url;
    }

    // Handle slides/video files
    const slidesVideoFiles = formData.getAll('slidesVideoFiles');
    courseData.slidesVideoFiles = await Promise.all(
      slidesVideoFiles
        .filter(file => file.size > 0)
        .map(async (file) => {
          const result = await uploadToCloudinary(file);
          return {
            type: result.type,
            url: result.url
          };
        })
    );

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