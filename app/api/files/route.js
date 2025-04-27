import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb"; // <-- remove {}
import Archive from "@/models/Archive";
import { getServerSession } from "next-auth/next"; // <-- more correct import
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const newFile = await Archive.create({
    ...data,
    owner: session.user.id,
  });

  return NextResponse.json(newFile, { status: 201 });
}

export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFiles = await Archive.find({ owner: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(userFiles);
}

export async function DELETE(req) {
  await connectMongoDB();
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  const fileToDelete = await Archive.findOne({ _id: id, owner: session.user.id });

  if (!fileToDelete) {
    return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 });
  }

  await Archive.findByIdAndDelete(id);
  return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
}