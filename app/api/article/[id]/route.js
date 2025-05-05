import connectMongoDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Article from "@/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 



export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const article = await Article.findById(params.id);
    if (!article) {
      return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(article), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch article" }), { status: 500 });
  }
}



// Handle PUT request to update an article
export async function PUT(req, { params }) {
  const { id } = params;
  const updates = await req.json();

  await connectMongoDB();

  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );

  return new Response(JSON.stringify(updatedArticle), { status: 200 });
}


export const DELETE = async (req, { params }) => {
  try {
    await connectMongoDB();

    const deletedArticle = await Article.findByIdAndDelete(params.id);
    if (!deletedArticle) {
      return new Response("Article not found", { status: 404 });
    }

    return new Response("Article deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return new Response("Failed to delete the article", { status: 500 });
  }
};


