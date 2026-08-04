import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

/**
 * GET /api/study-pdfs/:id/proxy
 * Fetches the PDF from Cloudinary server-side and streams it back
 * to the client — completely bypasses iframe CORS / X-Frame-Options
 * restrictions imposed by Cloudinary CDN.
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
        const upstream = await fetch(pdf.pdfUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; DevTrackBot/1.0)" },
        });

        if (!upstream.ok) {
            return NextResponse.json({ error: "Failed to fetch PDF from storage" }, { status: 502 });
        }

        const buffer = await upstream.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${encodeURIComponent(pdf.title)}.pdf"`,
                "Content-Length": buffer.byteLength.toString(),
                // Allow embedding in our own origin
                "X-Frame-Options": "SAMEORIGIN",
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch {
        return NextResponse.json({ error: "Proxy error" }, { status: 500 });
    }
}
