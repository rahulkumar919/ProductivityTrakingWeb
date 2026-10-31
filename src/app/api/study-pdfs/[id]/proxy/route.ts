import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";
import { getFileFromGridFS } from "@/lib/gridfs";
import { Readable } from "stream";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

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

    const title = (pdf.title as string) ?? "document";
    const filename = `${title.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`;
    const disposition = `inline; filename="${encodeURIComponent(filename)}"`;

    /* ── STRATEGY 1: Stream directly from MongoDB GridFS (Permanent Database Storage) ── */
    if (pdf.fileId) {
        try {
            const gridFile = await getFileFromGridFS(pdf.fileId);
            if (gridFile && gridFile.stream) {
                const webStream = Readable.toWeb(gridFile.stream) as ReadableStream;
                return new NextResponse(webStream, {
                    status: 200,
                    headers: {
                        "Content-Type": gridFile.contentType || "application/pdf",
                        "Content-Disposition": disposition,
                        "Content-Length": String(gridFile.length),
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
                        "X-Content-Type-Options": "nosniff",
                    },
                });
            }
        } catch (err) {
            console.error("GridFS read error:", err);
        }
    }

    /* ── STRATEGY 2: Backup base64 in MongoDB document ── */
    const b64 = (pdf.pdfData as string) ?? "";
    if (b64 && b64.length > 10) {
        const base64 = b64.includes(",") ? b64.split(",")[1] : b64;
        const buf = Buffer.from(base64, "base64");
        return new NextResponse(buf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": disposition,
                "Content-Length": String(buf.length),
                "Accept-Ranges": "bytes",
                "Cache-Control": "private, max-age=3600",
                "X-Content-Type-Options": "nosniff",
            },
        });
    }

    /* ── STRATEGY 3: Legacy remote URL fallback (old Cloudinary uploads) ── */
    const pdfUrl = (pdf.pdfUrl as string) ?? "";
    if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
        try {
            const r = await fetch(pdfUrl, {
                headers: { "Accept": "application/pdf,*/*", "User-Agent": "Mozilla/5.0" },
                cache: "no-store",
            });
            if (r.ok) {
                const buf = await r.arrayBuffer();
                if (buf.byteLength > 100) {
                    return new NextResponse(Buffer.from(buf), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/pdf",
                            "Content-Disposition": disposition,
                            "Content-Length": String(buf.byteLength),
                        },
                    });
                }
            }
        } catch { /* ignore */ }
    }

    return NextResponse.json(
        { error: "PDF could not be loaded from database. Please re-upload.", id },
        { status: 404 }
    );
}
