import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Cache the connection globally in a way that works well with Next.js.
let cached = global.mongoose || { conn: null, promise: null };

async function connectMongoDB() {
  // If there's already a cached connection, return it
  if (cached.conn) return cached.conn;

  // If no connection is cached, set up a new one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }

  // Store the connection once the promise resolves
  cached.conn = await cached.promise;

  return cached.conn;
}

export default connectMongoDB;

