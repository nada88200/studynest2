import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Note from "@/models/Note";

export async function PUT(req, { params }) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const data = await req.json();
  const updated = await Note.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    data,
    { new: true }
  );
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await Note.findOneAndDelete({ _id: params.id, userId: session.user.id });
  return Response.json({ success: true });
}
