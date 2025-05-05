// app/editarticle/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    coverImage: "",
  });

  useEffect(() => {
    const fetchArticle = async () => {
      const res = await fetch(`/api/article/${id}`);
      const data = await res.json();
      setArticle(data);
      setForm({
        title: data.title,
        category: data.category,
        content: data.content,
        coverImage: data.coverImage,
      });
    };
    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
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
      setForm((prev) => ({ ...prev, coverImage: data.secure_url }));
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/article/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/article");
    } else {
      console.error("Failed to update article");
    }
  };

  if (!article) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-10 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">Edit Article</h1>
      <form onSubmit={handleUpdate} className="max-w-3xl mx-auto space-y-6">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-white/10 text-white"
          placeholder="Title"
          required
        />
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-white/10 text-white"
          placeholder="Category"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-white/10 text-white"
          placeholder="Content"
          rows={6}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 bg-white/20 rounded-lg text-white"
        />
        {form.coverImage && (
          <Image
            src={form.coverImage}
            alt="Cover"
            width={200}
            height={200}
            className="rounded-lg shadow-lg"
          />
        )}
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:scale-105 transition duration-300"
        >
          Update Article
        </button>
      </form>
    </div>
  );
}
