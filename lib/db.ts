import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/** Cached connection to avoid recreating on every hot-reload */
let cached = (global as any).__mongoose;

if (!cached) {
  cached = (global as any).__mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
