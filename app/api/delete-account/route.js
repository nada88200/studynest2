import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    await connectMongoDB();

    // Safely fetch the user by email (since session.user may not include _id)
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    await User.findByIdAndDelete(user._id);

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
    });
  }
}
