//app\api\courses[id]\files\route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import Course from "@/models/Course";

export async function DELETE(request, { params }) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = params;
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return NextResponse.json(
      { error: 'File URL is required' },
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

    // Check if user is the course author or admin
    if (course.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to modify this course' },
        { status: 403 }
      );
    }

    // Remove the file from the array
    const updatedFiles = course.slidesVideoFiles.filter(file => file.url !== fileUrl);

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { slidesVideoFiles: updatedFiles },
      { new: true }
    );

    return NextResponse.json({ course: updatedCourse }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
