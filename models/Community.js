// models/Community.js
import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  moderators: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  avatar: {
    type: String,
    default: ''
  },
  rules: {
    type: [String],
    default: [
      'Be respectful to all members',
      'No spam or self-promotion',
      'Keep discussions on-topic',
      'No offensive language'
    ]
  },
  pendingInvites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  strictPopulate: false // Important for flexibility
});

// Add index for search functionality
communitySchema.index({ name: 'text', description: 'text' });

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;