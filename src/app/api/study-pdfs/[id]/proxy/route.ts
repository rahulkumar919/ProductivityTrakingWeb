import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

/**
 * Streams the PDF to the browser via a Cloudinary signed URL.
 * Cloudinary raw assets uploaded with resource_type:"raw" are private by default
 * and return 401 without a valid signature — so we generate one server-side.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const pdf = await StudyPdf.findOne({ _id: id, userId });
    if (!pdf) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        // Generate a signed URL valid for 1 hour
        const signedUrl = cloudinary.url(pdf.publicId, {
            resource_type: "raw",
            type: "upload",
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            secure: true,
        });

        const upstream = await fetch(signedUrl, {
            headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/pdf,*/*" },
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Storage returned ${upstream.status}` },
                { status: 502 }
            );
        }

        const buffer = await upstream.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${encodeURIComponent(pdf.title)}.pdf"`,
                "Content-Length": buffer.byteLength.toString(),
                "X-Frame-Options": "SAMEORIGIN",
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch (err) {
        console.error("[pdf-proxy] error:", err);
        return NextResponse.json({ error: "Proxy error" }, { status: 500 });
    }
}
