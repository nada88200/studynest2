// app/lib/fetchArticle.js
export async function fetchArticle(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/article/${id}`);
    if (!res.ok) return null;
    return res.json();
  }
  