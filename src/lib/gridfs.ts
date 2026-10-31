import mongoose from "mongoose";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { connectToDatabase } from "@/lib/db";

const BUCKET_NAME = "study_vault_files";

/**
 * Returns an instance of the MongoDB GridFSBucket.
 */
export async function getGridFSBucket(): Promise<mongoose.mongo.GridFSBucket> {
    const conn = await connectToDatabase();
    // Retrieve the active native MongoDB Db instance
    const db = conn.connection.db || (conn.connections && conn.connections[0] && conn.connections[0].db);
    if (!db) {
        throw new Error("MongoDB database connection is not established.");
    }
    return new conn.mongo.GridFSBucket(db, {
        bucketName: BUCKET_NAME,
    });
}

/**
 * Streams directly from a Node.js Readable stream into MongoDB GridFS.
 * This has zero memory buffering and handles any file size (1MB - 50MB+) without parsing limits.
 */
export async function saveStreamToGridFS(
    stream: Readable,
    filename: string,
    contentType: string = "application/pdf"
): Promise<string> {
    const bucket = await getGridFSBucket();
    const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
            contentType,
            uploadedAt: new Date(),
        },
    });

    const fileId = uploadStream.id.toString();
    await pipeline(stream, uploadStream);
    return fileId;
}

/**
 * Uploads a file Buffer directly into MongoDB GridFS using Node streams pipeline.
 * Returns the hex string of the stored GridFS file ID.
 */
export async function saveFileToGridFS(
    buffer: Buffer,
    filename: string,
    contentType: string = "application/pdf"
): Promise<string> {
    const bucket = await getGridFSBucket();
    const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
            contentType,
            uploadedAt: new Date(),
        },
    });

    const fileId = uploadStream.id.toString();
    const readStream = Readable.from(buffer);

    // Wait for the stream pipeline to flush all chunks and commit the file to MongoDB Atlas
    await pipeline(readStream, uploadStream);

    return fileId;
}

/**
 * Retrieves a file stream and file metadata from MongoDB GridFS.
 */
export async function getFileFromGridFS(fileId: string) {
    if (!fileId || typeof fileId !== "string" || fileId.length < 12) {
        return null;
    }

    const bucket = await getGridFSBucket();
    const id = new mongoose.mongo.ObjectId(fileId);

    const files = await bucket.find({ _id: id }).toArray();
    if (!files || files.length === 0) {
        return null;
    }

    const fileDoc = files[0];
    const downloadStream = bucket.openDownloadStream(id);
    const metadata = fileDoc.metadata as { contentType?: string } | undefined;

    return {
        stream: downloadStream,
        filename: fileDoc.filename,
        contentType: metadata?.contentType || "application/pdf",
        length: fileDoc.length,
    };
}

/**
 * Deletes a file from MongoDB GridFS.
 */
export async function deleteFileFromGridFS(fileId: string): Promise<void> {
    if (!fileId || typeof fileId !== "string" || fileId.length < 12) {
        return;
    }

    try {
        const bucket = await getGridFSBucket();
        const id = new mongoose.mongo.ObjectId(fileId);
        await bucket.delete(id);
    } catch (err) {
        console.warn("deleteFileFromGridFS warning (file might already be deleted):", err);
    }
}
