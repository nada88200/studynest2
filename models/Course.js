// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    title: { type: String, required: true , unique: true  },
    category: { type: String },
    price: { type: Number },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessons: { type: Number },
    students: { type: Number, default: 0 },
    reviewNumber: { type: Number, default: 0 },
ratings: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}],
averageRating: { type: Number, default: 0 },
reviewNumber: { type: Number, default: 0 },

    image: { type: String },
    description: String,
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    slidesVideoFiles: [
      {
        type: {
          type: String, // e.g. 'photo', 'pdf', 'video'
          enum: ['photo', 'pdf', 'video'],
          required: true,
        },
        url: { type: String, required: true },
      },
    ],

    // ✅ Move enrolledUsers here
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

courseSchema.index({ title: 1 }, { unique: true });


  export default mongoose.models.Course || mongoose.model('Course', courseSchema);