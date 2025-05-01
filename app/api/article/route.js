// app/api/article/route.js

import connectMongoDB from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    await connectMongoDB();

    const newArticle = await Article.create(body);
    return NextResponse.json(newArticle); // ✅ always return JSON
  } catch (error) {
    console.error("POST /api/article error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create article" }),
      { status: 500 }
    );
  }
}

export async function GET() {
    try {
      await connectMongoDB();
      const articles = await Article.find().sort({ createdAt: -1 });
      return NextResponse.json(articles);
    } catch (error) {
      console.error("GET /api/article error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch articles" }),
        { status: 500 }
      );
    }
  }