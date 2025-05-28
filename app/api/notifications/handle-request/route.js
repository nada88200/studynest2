// app/api/notifications/handle-request/route.js
import connectMongoDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/user";

export async function POST(req) {
  await connectMongoDB();
  const { notificationId, decision, senderId } = await req.json();

  // Update user role if accepted
  if (decision === "accepted") {
    await User.findByIdAndUpdate(senderId, { role: "tutor" });
  }

  // Update original notification
  await Notification.findByIdAndUpdate(notificationId, { status: decision });

  // Notify user
  await Notification.create({
    recipientId: senderId,
    type: decision === "accepted" ? "request_accepted" : "request_rejected",
    message:
      decision === "accepted"
        ? "Your request to become a teacher has been accepted!"
        : "Your request to become a teacher was rejected.",
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
