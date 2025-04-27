import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import connectMongoDB from "@/lib/mongodb";
import Archive from "@/models/Archive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const fileName = `${Date.now()}-${file.name}`;

    const filePath = path.join(process.cwd(), "public/uploads", fileName);
    await writeFile(filePath, buffer);

    const fileRecord = await Archive.create({
      name: file.name,
      type: file.type,
      size: file.size,
      tag,
      owner: session.user.id,
      preview: `/uploads/${fileName}`, // this will be accessible
    });

    uploadedFiles.push(fileRecord);
  }

  return NextResponse.json(uploadedFiles, { status: 201 });
}