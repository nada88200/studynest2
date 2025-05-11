// app/api/notifications/route.js
import connectMongoDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // const notifications = await Notification.find({
  //   recipientId: session.user.id,
  // }).sort({ createdAt: -1 });
  const notifications = await Notification.find({ recipientId: session.user.id })
    .sort({ createdAt: -1 })
    .populate("senderId", "name") // this replaces senderId with sender user object containing only the name
    .lean();


    const formatted = notifications.map((n) => ({
      ...n,
      sender : n.senderId?.name || "Unknown", // Use the sender's name if available, otherwise fallback to session user name
    }));
    console.log("Formatted notifications:", formatted);

  // return new Response(JSON.stringify(notifications), { status: 200 });
  return new Response(JSON.stringify(formatted), { status: 200 });
}

export async function POST(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { recipientId: recipientEmail, type, articleId } = await req.json();

  const User = (await import('@/models/user')).default;
  const Article = (await import('@/models/Article')).default;

  const recipientUser = await User.findOne({ email: recipientEmail });
  if (!recipientUser) {
    return new Response(JSON.stringify({ error: "Recipient not found" }), { status: 404 });
  }

  const senderUser = await User.findById(session.user.id);
  if (!senderUser) {
    return new Response(JSON.stringify({ error: "Sender not found" }), { status: 404 });
  }
  const article = await Article.findById(articleId);
  if (!article) {
    return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
  }


  const newNotification = new Notification({
    recipientId: recipientUser._id,
    senderId: senderUser._id,
    type,
    articleId,
    message: `${senderUser.name} liked your article "${article.title}"`,
  });

  await newNotification.save();

  return new Response(JSON.stringify(newNotification), { status: 201 });
}
