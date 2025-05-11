import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
});

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Note' },
  content: { type: String },
  tags: [String],
  todos: [todoSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Note || mongoose.model('Note', noteSchema);
