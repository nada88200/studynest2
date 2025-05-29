import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const notes = await Note.find({ userId: session.user.id });
  return Response.json(notes);
}

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const data = await req.json();
  const newNote = await Note.create({
    ...data,
    userId: session.user.id,
  });

  return Response.json(newNote);
}
