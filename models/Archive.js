import mongoose from "mongoose";

const ArchiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    tag: {
      type: String,
      default: "Uncategorized",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    preview: {
      type: String,
      required: false, // You can make it optional because real "preview" is usually generated on the client.
    },
  },
  { timestamps: true }
);

// Prevent re-defining model on hot reload
export default mongoose.models.Archive || mongoose.model("Archive", ArchiveSchema);