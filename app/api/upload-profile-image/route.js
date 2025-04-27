// app/api/upload-profile-image/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import  connectMongoDB  from "@/lib/mongodb";
import User from "@/models/user";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Basic file validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    await connectMongoDB();

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `profile-${session.user.id}${path.extname(file.name)}`;
    const filePath = path.join(process.cwd(), "public", "images", "profiles", fileName);
    
    await writeFile(filePath, buffer);

    // Update database
    const photoPath = `/images/profiles/${fileName}`;
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { photo: photoPath },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      // Clean up the uploaded file if DB update failed
      await unlink(filePath).catch(console.error);
      return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      photo: photoPath,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}