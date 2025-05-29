// app/api/article/route.js

import connectMongoDB from "@/lib/mongodb";
import Article from "@/models/Article";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req) {
  
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    await connectMongoDB();

    const newArticle = await Article.create({
      ...body,
      userId: session.user.email,
    });
    console.log("POST payload:", body);
    return NextResponse.json(newArticle); // ✅ always return JSON
  } catch (error) {
    console.error("POST /api/article error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create article" }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
    try {
      await connectMongoDB();
  
      const { searchParams } = new URL(req.url);
      const search = searchParams.get("search") || "";
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const category = searchParams.get("category");
      const userId = searchParams.get("userId"); // Add userId to fetch user-specific articles
  
      const filter = {};
  
      // Title search (case-insensitive)
      if (search) {
        filter.title = { $regex: search, $options: "i" };
      }
  
      // Category filter
      if (category && category !== "All") {
        filter.category = category;
      }
  
      // Filter by user (if userId is provided)
      if (userId) {
        filter.username = userId;
      }
  
      // Sorting config
      const sortOptions = {};
      if (sortBy === "title" || sortBy === "category") {
        sortOptions[sortBy] = 1; // ascending
      } else {
        sortOptions.createdAt = -1; // default: newest first
      }
  
      const articles = await Article.find(filter).sort(sortOptions);
      return NextResponse.json(articles);
    } catch (error) {
      console.error("GET /api/article error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch articles" }),
        { status: 500 }
      );
    }
  }
  
