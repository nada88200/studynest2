// app/api/upload-profile-image/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return Response.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const base64String = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "profile_images",
      public_id: `${session.user.id}-${Date.now()}`,
    });

    await connectMongoDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { photo: result.secure_url },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true, photo: result.secure_url });

  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
