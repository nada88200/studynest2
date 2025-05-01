import connectMongoDB from "@/lib/mongodb";
import Article from "@/models/Article";

export async function DELETE(req, { params }) {
  await connectMongoDB();
  await Article.findByIdAndDelete(params.id);
  return Response.json({ message: "Article deleted" });
}
