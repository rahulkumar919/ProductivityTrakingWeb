import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";

export async function POST(request: Request) {
    // If Cloudinary is not configured, return a clear error
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        return NextResponse.json(
            { error: "Cloudinary is not configured. Please add CLOUDINARY_* credentials to .env.local" },
            { status: 503 }
        );
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { image?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { image } = body;
    if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "image (base64 data URL) is required" }, { status: 400 });
    }

    // Validate it's actually an image data URL
    if (!image.startsWith("data:image/")) {
        return NextResponse.json({ error: "image must be a base64 data URL (data:image/...)" }, { status: 400 });
    }

    await connectToDatabase();

    // Delete old avatar from Cloudinary if it exists
    const existing = await User.findById(user.userId).select("avatarPublicId");
    if (existing?.avatarPublicId) {
        try {
            await deleteFromCloudinary(existing.avatarPublicId);
        } catch {
            // Non-fatal: old image delete failed, continue with upload
        }
    }

    // Upload new avatar
    const { publicId, url } = await uploadToCloudinary(image, "devtrack/avatars");

    // Save to DB
    await User.updateOne(
        { _id: user.userId },
        { avatarUrl: url, avatarPublicId: publicId }
    );

    return NextResponse.json({ ok: true, avatarUrl: url });
}
