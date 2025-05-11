// models/Article.js
import mongoose, { Schema, model, models } from "mongoose";

const ArticleSchema = new Schema({
  title: String,
  category: String,
  content: String,
  username: String,
  coverImage: String,
  userImage: String,
  userId: { type: String, required: true },
  likes: {
    type: [String], // store user IDs who liked the article
    default: [],
  },

  
  
}, { timestamps: true });

const Article = models.Article || model("Article", ArticleSchema);

export default Article;
