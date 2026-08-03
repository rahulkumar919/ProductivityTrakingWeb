import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { env } from "@/lib/env";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

export async function POST(request: Request) {
    // If Cloudinary is not configured, return a clear error
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        return NextResponse.json(
            { error: "Cloudinary is not configured. Please add CLOUDINARY_* credentials to .env.local" },
            { status: 503 }
        );
    }

    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    if (!image.startsWith("data:image/")) {
        return NextResponse.json({ error: "image must be a base64 data URL (data:image/...)" }, { status: 400 });
    }

    await connectToDatabase();

    // Delete old avatar from Cloudinary if it exists
    const existing = await User.findById(userId).select("avatarPublicId");
    if (existing?.avatarPublicId) {
        try {
            await deleteFromCloudinary(existing.avatarPublicId);
        } catch { /* non-fatal */ }
    }

    const { publicId, url } = await uploadToCloudinary(image, "devtrack/avatars");

    await User.updateOne(
        { _id: userId },
        { avatarUrl: url, avatarPublicId: publicId }
    );

    return NextResponse.json({ ok: true, avatarUrl: url });
}
