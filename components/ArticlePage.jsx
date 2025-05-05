// ArticlePage.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { articleData } from "@/data/data";
import { Nav } from "@/Home/Navbar/Nav";
import Image from "next/image";
import { useSession } from "next-auth/react";
// import { ArticleCard } from "@/Home/Article/ArticleCard";
import Tilt from 'react-parallax-tilt';
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { send } from "process";

export default function ArticlePage() {
    const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    coverImage: "",
    username: session?.user?.name || "",
    userImage: session?.user?.photo || "",
  });
  console.log("Session user photo:", session?.user?.photo);
  const [articles, setArticles] = useState([]);
 
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    fetchArticles();
  }, [session, searchTerm, sortBy, categoryFilter]);
  
  const fetchArticles = async () => {
    try {
      const query = new URLSearchParams({
        search: searchTerm,
        sortBy,
        category: categoryFilter,
      });
  
      const res = await fetch(`/api/article?${query.toString()}`);
      const text = await res.text();
  
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
      const data = JSON.parse(text);
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
    }
  }; 
  
  const myArticles = articles.filter((article) => article.username === session?.user?.name);
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
    if (!session) return;
  
    const article = {
      ...newArticle,
      username: session.user.name,
      userImage: session.user.photo,
      userId: session.user.id,
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
  
      const newSavedArticle = JSON.parse(text);
      setArticles((prev) => [...prev, newSavedArticle]);
  
      setNewArticle({
        title: "",
        category: "",
        content: "",
        coverImage: "",
        username: session.user.name,
        userImage: session.user.photo,
      });
      console.log("Backend response:", newSavedArticle);
        setShowForm(false);
    } catch (err) {
      console.error("Failed to add article:", err);
    }
  };
  
  
  

  const currentUserRole = session?.user?.role || "user";



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
        {!showForm && (
            <div className="text-center mb-8">
        <button
        onClick={() => setShowForm(true)}
        className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-xl hover:scale-105 transition duration-300"
        >
        Post an Article
         </button>
         </div>
            )}

            {showForm && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-2xl shadow-2xl mb-12 text-white">
            <h2 className="text-3xl font-bold mb-8">Post an Article</h2>
            <form
              onSubmit={handleAddArticle}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
             <div className="flex flex-col md:col-span-2 space-y-6">
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
                    <Image
                      src={newArticle.coverImage}
                      alt="Article Preview"
                      className="w-40 h-40 object-cover rounded-lg shadow-lg"
                        width={160}
                        height={160}
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
            )}
            {/* My Articles Section */}
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-white">My Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-6">
              {myArticles.length === 0 ? (
                <p className="text-white">You have not posted any articles yet.</p>
              ) : (
                myArticles.map((article) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    currentUserRole="user"
                  />
                ))
              )}
            </div>
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
            <h2 className="text-5xl font-bold text-white mb-6 text-center">All Articles</h2>
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

export const ArticleCard = ({ article, currentUserRole, onDelete }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes?.length || 0);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (session && article.likes?.includes(session.user.id)) {
      setLiked(true);
    }
  }, [session, article.likes]);

  const toggleLike = async () => {
    if (!session) return;

    try {
      const res = await fetch(`/api/article/${article._id}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error liking the article:", errorText);
        return;
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);

      if (data.liked) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: article.userId,
            senderId: session.user.id,
            type: "like",
            articleId: article._id,
            message: `${session.user.name} liked your article "${article.title}"`,
          }),
        });
      }
      
    } catch (err) {
      console.error("Error liking the article:", err);
    }
  };

  const handleEditArticle = () => {
    // Navigate to edit page with article ID
    router.push(`/editarticle/${article._id}`);
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const res = await fetch(`/api/article/${articleId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete article");
        }
  
        // Remove from UI
        setArticles((prev) => prev.filter((article) => article._id !== articleId));
      } catch (err) {
        console.error("Error deleting the article:", err);
      }
    }
  };
  
  

  return (
    <Tilt>
      <div className="bg-white rounded-lg overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          width={300}
          height={300}
          className="w-full h-full"
        />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={article.userImage || process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PHOTO}
                alt="Profile"
                className="rounded-full"
                width={40}
                height={40}
              />
              <p className="text-base text-black text-opacity-70">
                {article.username}
              </p>
            </div>
            {article.username === session?.user?.name && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEditArticle}
                  className="text-blue-500 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteArticle(article._id)}
                 className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleLike}>
              {liked ? (
                <BiSolidHeart className="text-red-600 text-xl" />
              ) : (
                <BiHeart className="text-red-600 text-xl" />
              )}
              <p className="text-sm text-gray-800">{likeCount}</p>
            </div>
          </div>
          <p className="text-base text-gray-700 mt-4">{article.content}</p>
          {/* <button
            onClick={() => router.push("/individualarticle")}
            className="mt-4 mb-3 hover:text-green-600 text-lg text-black font-bold underline"
          >
            Learn More
          </button> */}

          <button
          onClick={() => router.push(`/article/${article._id}`)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >   
        Learn More
        </button>
        </div>
      </div>
    </Tilt>
  );
};
