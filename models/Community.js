import mongoose from 'mongoose';

// const communitySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 50
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 500
//   },
//   type: {
//     type: String,
//     enum: ['public', 'private'],
//     default: 'public'
//   },
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   members: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   moderators: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   avatar: {
//     type: String,
//     default: ''
//   },
//   rules: {
//     type: [String],
//     default: [
//       'Be respectful to all members',
//       'No spam or self-promotion',
//       'Keep discussions on-topic',
//       'No offensive language'
//     ]
// }

// }, {
//   timestamps: true
// });

// In your Community model (backend)
const communitySchema = new mongoose.Schema({
    name: String,
    description: String,
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pendingInvites: [{
      email: String,
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true
  });
// Add index for search functionality
communitySchema.index({ name: 'text', description: 'text' });

const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;