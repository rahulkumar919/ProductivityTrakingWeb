import mongoose from "mongoose";
import { env } from "@/lib/env";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: CachedConnection;
};

const cache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cache;

export async function connectToDatabase() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required for database operations.");
  }

  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(env.mongodbUri, {
    bufferCommands: false,
    dbName: process.env.MONGODB_DB ?? "devtrack_ai",
  });

  cache.conn = await cache.promise;
  return cache.conn;
}
