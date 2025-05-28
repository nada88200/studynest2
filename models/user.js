//models\user.js
import { models, Schema } from "mongoose";
import mongoose from "mongoose";
//import { unique } from "next/dist/build/utils";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      match: /@/, 
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (v) {
          return /[a-zA-Z]/.test(v); // Ensures at least one letter
        },
        message: "Password must contain at least one letter",
      },
    },
    role: {
      type: String,
      enum: ["admin", "tutor", "user"],
      default: "user",
    },
    photo: {
      type: String,
      default: process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PHOTO  // Add this new field
    },

    userCourses: [{
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: []
    }],


    archive: [{
      type: Schema.Types.ObjectId,
      ref: "Archive",
      default: []
    }],
    



  },
  
  {  timestamps: true,
    strictPopulate: false // Add this to prevent strict population errors
     }
);
userSchema.set('strictPopulate', false);

const User = models.User || mongoose.model("User", userSchema);

export default User;