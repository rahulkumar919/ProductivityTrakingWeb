import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { env } from "@/lib/env";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

async function sha1(msg: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(msg));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * GET /api/study-pdfs/upload-url
 *
 * Returns signed Cloudinary upload credentials for direct browser-to-Cloudinary upload.
 * Using resource_type=raw so the PDF gets served with correct application/pdf content-type.
 *
 * IMPORTANT — Cloudinary signature rules for signed uploads:
 *   Include ALL body params alphabetically EXCEPT: file, api_key, resource_type, type.
 *   So only `folder` and `timestamp` are signed here.
 *
 * The resource_type goes in the upload URL path (/raw/upload), NOT in the body.
 */
export async function GET() {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        return NextResponse.json({ error: "Cloudinary not configured." }, { status: 503 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "devtrack/study-pdfs";

    // Sign only body params (alphabetical), excluding: file, api_key, resource_type, type
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = await sha1(paramsToSign + env.cloudinaryApiSecret);

    return NextResponse.json({
        signature,
        timestamp,
        apiKey: env.cloudinaryApiKey,
        cloudName: env.cloudinaryCloudName,
        folder,
        resourceType: "raw",
    });
}
