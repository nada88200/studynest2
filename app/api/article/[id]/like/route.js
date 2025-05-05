// /api/article/[id]/like/route.js
import connectMongoDB from "@/lib/mongodb";
import Article from "@/models/Article";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function PUT(req, { params }) {
  try {
    const { userId } = await req.json();
    await connectMongoDB();

    // Find the article
    const article = await Article.findById(params.id);
    if (!article) {
      console.error(`Article with id ${params.id} not found`);
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the user has already liked the article
    const hasLiked = article.likes.includes(userId);
    console.log("Has user liked this article?", hasLiked);

    // Add or remove the like
    if (hasLiked) {
      article.likes = article.likes.filter((id) => id.toString() !== userId);
    } else {
      article.likes.push(userId);
    }

    // Save the updated article
    await article.save();
    console.log("Article saved with updated likes:", article.likes);

    return new Response(
      JSON.stringify({
        liked: !hasLiked,
        likeCount: article.likes.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating like:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update like" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


// export async function POST(req, { params }) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return new Response(JSON.stringify({ error: "Unauthorized" }), {
//       status: 401,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   try {
//     await connectMongoDB();

//     const article = await Article.findById(params.id);
//     if (!article) {
//       return new Response(JSON.stringify({ error: "Article not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Avoid notifying the user if they liked their own article
//     if (article.username !== session.user.name) {
//       const notification = new Notification({
//         recipientId: article.userId, // assuming Article has a userId field
//         senderId: senderUser._id,
//         message: `${session.user.name} liked your article "${article.title}"`,
//         type: "like",
//         articleId: article._id,
//       });

//       await notification.save();
//     }

//     return new Response(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error creating notification:", error);
//     return new Response(JSON.stringify({ error: "Failed to create notification" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
