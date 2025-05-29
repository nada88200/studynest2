// /api/teacher-request-response/route.js
import connectMongoDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  const { userId, accepted } = await req.json();

  const admin = await User.findOne({ email: session.user.email });

  if (!admin || admin.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const user = await User.findById(userId);
  if (!user) return new Response("User not found", { status: 404 });

  // Update role if accepted
  if (accepted) {
    user.role = "tutor";
    await user.save();
  }

  // Send response notification to user
  await Notification.create({
    recipientId: userId,
    senderId: admin._id.toString(),
    type: "teacher_request_response",
    message: accepted
      ? "Your request to become a teacher was accepted 🎉"
      : "Your request to become a teacher was rejected ❌",
    isRead: false,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
