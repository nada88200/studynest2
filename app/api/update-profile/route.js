// app/api/update-profile/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import  connectMongoDB  from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await request.json();
    await connectMongoDB();

    // Basic validation
    if (!data.name || !data.email) {
      return Response.json({ error: "Name and email are required" }, { status: 400 });
    }

    const updateData = {
      name: data.name,
      email: data.email,
    };

    // Password change logic
    if (data.currentPassword && data.newPassword) {
      const user = await User.findById(session.user.id);
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const passwordsMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!passwordsMatch) {
        return Response.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return Response.json({ error: "Failed to update user" }, { status: 500 });
    }

    // Return updated user data
    return Response.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        photo: updatedUser.photo,
        role: updatedUser.role,
      }
    });

  } catch (error) {
    console.error("Update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}