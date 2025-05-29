import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchArticle } from "@/app/lib/fetchArticle"; // ✅ fixed import

export default async function ArticleDetailPage({ params }) {
  const article = await fetchArticle(params.id);
  if (!article) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-8">
      <div className="max-w-4xl mx-auto bg-white/10 p-8 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-xl text-purple-200 mb-2">By {article.username}</p>
        <Image
          src={article.coverImage}
          alt={article.title}
          width={600}
          height={300}
          className="rounded-lg mb-6 mx-auto"
        />
        <div className="text-white text-lg leading-7 mb-6">
          <p>{article.content}</p>
        </div>
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-400">
            Published on {new Date(article.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
