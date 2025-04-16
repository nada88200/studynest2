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
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;