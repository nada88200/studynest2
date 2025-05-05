// app/api/teacher-request/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/user";

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  const data = await req.json();

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const sender = await User.findById(session.user.id);
  const admins = await User.find({ role: "admin" });

  const message = `${sender.name} wants to become a teacher.`;

  // Create a notification for each admin
  await Promise.all(
    admins.map((admin) =>
      Notification.create({
        recipientId: admin._id,
        senderId: sender._id,
        type: "teacher_request",
        message,
      })
    )
  );

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
