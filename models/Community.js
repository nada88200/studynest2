import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member',
      },
    }],
    memberCount: {
      type: Number,
      default: 1,
    },
    avatar: {
      type: String,
      default: null,
    },
    rules: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

communitySchema.index({ type: 1, isActive: 1 });
communitySchema.index({ 'members.user': 1 });

// Update memberCount when members array changes
communitySchema.pre('save', function(next) {
  this.memberCount = this.members.length;
  next();
});

export default mongoose.models.Community || mongoose.model('Community', communitySchema);