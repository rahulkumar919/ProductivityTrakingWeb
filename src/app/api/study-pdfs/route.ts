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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

/* GET — list all PDFs for user (exclude pdfData to keep response small) */
export async function GET() {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const pdfs = await StudyPdf.find({ userId }).select("-pdfData").sort({ createdAt: -1 });
    return NextResponse.json(pdfs);
}

/* POST — save PDF metadata after client-side Cloudinary upload */
export async function POST(request: Request) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json() as {
        title: string;
        category: string;
        pdfUrl: string;      // secure_url from Cloudinary (uploaded by browser)
        publicId: string;    // public_id from Cloudinary
        fileSize: number;
        totalPages: number;
    };

    if (!body.pdfUrl || !body.publicId || !body.title) {
        return NextResponse.json({ error: "title, pdfUrl, and publicId are required" }, { status: 400 });
    }

    await connectToDatabase();
    const count = await StudyPdf.countDocuments({ userId });
    const color = COLORS[count % COLORS.length];

    const pdf = await StudyPdf.create({
        userId,
        title: body.title,
        category: body.category || "General",
        pdfUrl: body.pdfUrl,
        publicId: body.publicId,
        fileSize: body.fileSize,
        totalPages: body.totalPages || 1,
        lastPage: 1,
        color,
        notes: [],
    });

    return NextResponse.json(pdf, { status: 201 });
}
