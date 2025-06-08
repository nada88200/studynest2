// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipientId: String,
  senderId: String,
  articleId: String,
  type: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  metadata: {
    communityId: { type: String, required: true },
    inviteId: { type: String, required: true },
    inviterId: { type: String, required: true },
  }
});


export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
