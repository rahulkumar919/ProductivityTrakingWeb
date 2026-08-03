import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";
import cloudinary from "cloudinary";
import { env } from "@/lib/env";

cloudinary.v2.config({
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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

/* GET — list all PDFs for user */
export async function GET() {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const pdfs = await StudyPdf.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(pdfs);
}

/* POST — upload new PDF (base64) */
export async function POST(request: Request) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
    }

    const body = await request.json() as {
        title: string;
        category: string;
        data: string;        // base64 data URL
        fileSize: number;
        totalPages: number;
    };

    if (!body.data || !body.title) {
        return NextResponse.json({ error: "title and data required" }, { status: 400 });
    }

    await connectToDatabase();
    const count = await StudyPdf.countDocuments({ userId });
    const color = COLORS[count % COLORS.length];

    // Upload PDF to Cloudinary as raw file
    const result = await cloudinary.v2.uploader.upload(body.data, {
        folder: "devtrack/study-pdfs",
        resource_type: "raw",
        format: "pdf",
    });

    const pdf = await StudyPdf.create({
        userId,
        title: body.title,
        category: body.category || "General",
        pdfUrl: result.secure_url,
        publicId: result.public_id,
        fileSize: body.fileSize,
        totalPages: body.totalPages || 1,
        lastPage: 1,
        color,
        notes: [],
    });

    return NextResponse.json(pdf, { status: 201 });
}
