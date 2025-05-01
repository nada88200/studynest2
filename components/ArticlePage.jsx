"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { articleData } from "@/data/data";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ArticleCard } from "@/Home/Article/ArticleCard";

export default function ArticlePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    author: "",
    coverImage: "",
  });
  const [articles, setArticles] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/article");
        const text = await res.text();
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
  
        const data = JSON.parse(text); // Safe parsing
        setArticles(data);
      } catch (error) {
        console.error("Failed to load articles:", error);
      }
    };
  
    fetchArticles();
  }, []);
  
  
  const filteredArticles = articles
    .filter((article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((article) =>
      categoryFilter === "All" ? true : article.category === categoryFilter
    )
    .sort((a, b) =>
      typeof a[sortBy] === "string"
        ? a[sortBy].localeCompare(b[sortBy])
        : a[sortBy] - b[sortBy]
    );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    const article = {
      ...newArticle,
      username: session?.user?.name || newArticle.author,
    };
  
    try {
      const res = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
  
      const text = await res.text();
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} - ${text}`);
      }
  
      const newSavedArticle = JSON.parse(text); // Safer
      setArticles((prev) => [...prev, newSavedArticle]);
  
      setNewArticle({
        title: "",
        category: "",
        content: "",
        author: "",
        coverImage: "",
      });
    } catch (err) {
      console.error("Failed to add article:", err);
    }
  };
  
  

  const currentUserRole = session?.user?.role || "user";
  const handleDeleteArticle = async (id) => {
    await fetch(`/api/article/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((article) => article._id !== id));
  };
  

  return (
    <div>
      <Nav />
      <div className="pt-32 pb-16 relative bg-gradient-to-br from-indigo-900 to-purple-800 min-h-screen">
        <Image
          src="/images/cb.png"
          alt="bg image"
          width={800}
          height={800}
          className="absolute top-[30%] animate-bounce"
        />

        <div className="w-[80%] pt-8 pb-8 mx-auto relative z-10">
          {/* Post an Article Section */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-2xl shadow-2xl mb-12 text-white">
            <h2 className="text-4xl font-bold mb-8">Post an Article</h2>
            <form
              onSubmit={handleAddArticle}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Article Title</label>
                <input
                  type="text"
                  name="title"
                  value={newArticle.title}
                  onChange={handleInputChange}
                  placeholder="Enter Article Title"
                  className="p-4 rounded-lg w-full bg-white/10 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  value={newArticle.author}
                  onChange={handleInputChange}
                  placeholder="Enter Author Name"
                  className="p-4 rounded-lg w-full bg-white/10 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={newArticle.category}
                  onChange={handleInputChange}
                  placeholder="Enter Category"
                  className="p-4 rounded-lg w-full bg-white/10 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xl font-semibold mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                     onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

                    try {
                    const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
                    {
                    method: "POST",
                    body: formData,
                    }
                );

                const data = await res.json();
                setNewArticle((prev) => ({
                    ...prev,
                    coverImage: data.secure_url,
                }));
                } catch (err) {
                console.error("Image upload failed:", err);
                }
                }}
                className="p-3 bg-white/20 rounded-lg text-white"
                required
                />

                {newArticle.coverImage && (
                  <div className="mt-4 p-2 border-2 border-white/40 rounded-lg">
                    <img
                      src={newArticle.coverImage}
                      alt="Article Preview"
                      className="w-40 h-40 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-xl font-semibold mb-2">Content</label>
                <textarea
                  name="content"
                  value={newArticle.content}
                  onChange={handleInputChange}
                  placeholder="Enter Article Content"
                  className="p-4 rounded-lg w-full bg-white/10 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-center mt-8">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-xl hover:scale-105 transition duration-300"
                >
                  Add Article
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <input
              type="text"
              placeholder="Search articles..."
              className="p-2 rounded text-black w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 rounded text-black"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {/* Articles Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserRole={currentUserRole}
                onDelete={() => handleDeleteArticle(article.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
