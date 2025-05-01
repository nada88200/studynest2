// models/Article.js
import mongoose, { Schema, model, models } from "mongoose";

const ArticleSchema = new Schema({
  title: String,
  category: String,
  content: String,
  author: String,
  username: String,
  coverImage: String,
}, { timestamps: true });

const Article = models.Article || model("Article", ArticleSchema);

export default Article;
