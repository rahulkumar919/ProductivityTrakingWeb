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
 * Serves the PDF directly from the base64 stored in MongoDB.
 * No Cloudinary fetch needed — zero CORS issues.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    // Select pdfData explicitly (it may be excluded by default projections)
    const pdf = await StudyPdf.findOne({ _id: id, userId }).select("+pdfData +title");
    if (!pdf) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const b64 = pdf.pdfData as string | undefined;

    if (!b64 || b64.length < 10) {
        return NextResponse.json({ error: "PDF data not available" }, { status: 404 });
    }

    // Strip the data URL prefix if present: "data:application/pdf;base64,..."
    const base64 = b64.includes(",") ? b64.split(",")[1] : b64;
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(pdf.title)}.pdf"`,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "private, max-age=3600",
        },
    });
}
