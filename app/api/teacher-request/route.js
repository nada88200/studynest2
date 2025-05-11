// /api/teacher-request/route.js
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  const { reason } = await req.json();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });

  // Send to all admins
  const admins = await User.find({ role: "admin" });

  const notifications = admins.map((admin) => ({
    recipientId: admin._id.toString(),
    senderId: user._id.toString(),
    type: "teacher_request",
    message: `${user.email} wants to become a teacher: "${reason}"`,
    articleId: null,
    isRead: false,
  }));

  await Notification.insertMany(notifications);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
