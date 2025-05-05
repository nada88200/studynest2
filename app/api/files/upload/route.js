import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Archive from "@/models/Archive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files");
  const tag = formData.get("tag") || "Uncategorized";

  const uploadedFiles = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to a base64-encoded data URI
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "archive", // optional: creates folder in Cloudinary
      resource_type: "auto",
    });

    // Save metadata to MongoDB
    const fileRecord = await Archive.create({
      name: file.name,
      type: file.type,
      size: file.size,
      tag,
      owner: session.user.id,
      preview: uploadResult.secure_url,
    });

    uploadedFiles.push(fileRecord);
  }

  return NextResponse.json(uploadedFiles, { status: 201 });
}
