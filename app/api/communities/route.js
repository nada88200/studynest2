import connectMongoDB from "@/lib/mongodb";
import Community from '@/models/Community';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust the import path as necessary

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectMongoDB();
  
    try {
      const communities = await Community.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: communities }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
  }
  
  export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectMongoDB();
  
    try {
      const body = await request.json(); // Get JSON body from the request
      const community = await Community.create(body);
      return NextResponse.json({ success: true, data: community }, { status: 201 });
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        return NextResponse.json({ success: false, message: 'Community with this name already exists.' }, { status: 400 });
      } else {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
    }
  }
  
  // If you want to handle other methods, you'd export them like:
  // export async function PUT(request) { /* ... */ }
  // export async function DELETE(request) { /* ... */ }