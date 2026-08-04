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
 * GET /api/study-pdfs/:id/proxy
 *
 * Strategy:
 * 1. Try to stream the PDF by fetching the stored pdfUrl directly.
 *    Cloudinary raw files ARE publicly accessible by default — the original
 *    iframe failure was purely X-Frame-Options. Fetching server-side has no
 *    such restriction.
 * 2. If the direct fetch fails (e.g. private delivery), fall back to a
 *    signed Cloudinary URL and stream that.
 *
 * Either way we return the raw PDF bytes with proper headers so the browser
 * can display it inline without any embedding restriction.
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

    // ── Attempt 1: fetch the stored URL directly (no CORS on server) ──
    let buffer: ArrayBuffer | null = null;

    try {
        const res1 = await fetch(pdf.pdfUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/pdf,*/*",
            },
        });
        if (res1.ok) {
            buffer = await res1.arrayBuffer();
        } else {
            console.warn(`[proxy] direct fetch ${res1.status} for ${pdf.pdfUrl}`);
        }
    } catch (e) {
        console.warn("[proxy] direct fetch threw:", e);
    }

    // ── Attempt 2: signed Cloudinary URL ──
    if (!buffer) {
        try {
            const signedUrl = cloudinary.url(pdf.publicId, {
                resource_type: "raw",
                type: "upload",
                sign_url: true,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                secure: true,
                // Force attachment header off so it serves inline
                flags: "attachment:false",
            });

            const res2 = await fetch(signedUrl, {
                headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/pdf,*/*" },
            });

            if (res2.ok) {
                buffer = await res2.arrayBuffer();
            } else {
                console.error(`[proxy] signed fetch ${res2.status} for publicId ${pdf.publicId}`);
                return NextResponse.json(
                    { error: `Cloudinary returned ${res2.status}` },
                    { status: 502 }
                );
            }
        } catch (e) {
            console.error("[proxy] signed fetch threw:", e);
            return NextResponse.json({ error: "Proxy error" }, { status: 500 });
        }
    }

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
}
