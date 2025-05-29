import mongoose from 'mongoose';

const communityMessageSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  systemMessage: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const CommunityMessage = mongoose.models.CommunityMessage || mongoose.model('CommunityMessage', communityMessageSchema);

export default CommunityMessage;