import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";
import { saveFileToGridFS, saveStreamToGridFS } from "@/lib/gridfs";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes for uploading large documents

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

/* GET — list all PDFs for user (exclude heavy pdfData to keep response lightweight) */
export async function GET() {
    try {
        const userId = await resolveUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const pdfs = await StudyPdf.find({ userId }).select("-pdfData").sort({ createdAt: -1 });
        return NextResponse.json(pdfs);
    } catch (err: unknown) {
        console.error("GET /api/study-pdfs error:", err);
        const msg = err instanceof Error ? err.message : "Failed to load study PDFs";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

/* POST — upload PDF directly to MongoDB (stored permanently in database via GridFS) */
export async function POST(request: Request) {
    try {
        const userId = await resolveUserId();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        const url = new URL(request.url);
        const contentType = request.headers.get("content-type") || "";

        // 1. DIRECT BINARY STREAM (No multipart overhead, no memory buffers, handles any file size!)
        if (
            contentType.includes("application/pdf") ||
            contentType.includes("application/octet-stream") ||
            (!contentType.includes("multipart/form-data") && !contentType.includes("application/json"))
        ) {
            const rawTitle = url.searchParams.get("title") || request.headers.get("x-file-title") || "";
            const rawCategory = url.searchParams.get("category") || request.headers.get("x-file-category") || "General";
            const rawFilename = request.headers.get("x-file-name") || "document.pdf";
            const rawFileSize = Number(request.headers.get("x-file-size") || request.headers.get("content-length") || 0);

            const docTitle = decodeURIComponent(rawTitle) || decodeURIComponent(rawFilename).replace(/\.pdf$/i, "");
            const category = decodeURIComponent(rawCategory) || "General";
            const cleanFilename = `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

            if (!request.body) {
                return NextResponse.json({ error: "No file content received." }, { status: 400 });
            }

            // Stream directly from client request socket into MongoDB GridFS
            const nodeStream = Readable.fromWeb(request.body as import("stream/web").ReadableStream);
            const fileId = await saveStreamToGridFS(nodeStream, cleanFilename, "application/pdf");

            const count = await StudyPdf.countDocuments({ userId });
            const color = COLORS[count % COLORS.length];

            const pdf = await StudyPdf.create({
                userId,
                title: docTitle,
                category,
                pdfUrl: "",
                publicId: "",
                fileId,
                pdfData: "",
                fileSize: rawFileSize,
                totalPages: 1,
                lastPage: 1,
                color,
                notes: [],
            });

            // Set permanent proxy stream URL
            pdf.pdfUrl = `/api/study-pdfs/${pdf._id}/proxy`;
            await pdf.save();

            return NextResponse.json(pdf, { status: 201 });
        }

        // 2. Fallback for multipart/form-data
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;
            const title = (formData.get("title") as string)?.trim();
            const category = (formData.get("category") as string)?.trim() || "General";

            if (!file) {
                return NextResponse.json({ error: "Please select a PDF file to upload." }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const docTitle = title || file.name.replace(/\.pdf$/i, "");
            const cleanFilename = `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

            const fileId = await saveFileToGridFS(buffer, cleanFilename, file.type || "application/pdf");

            const count = await StudyPdf.countDocuments({ userId });
            const color = COLORS[count % COLORS.length];

            const pdf = await StudyPdf.create({
                userId,
                title: docTitle,
                category,
                pdfUrl: "",
                publicId: "",
                fileId,
                pdfData: "",
                fileSize: buffer.length,
                totalPages: 1,
                lastPage: 1,
                color,
                notes: [],
            });

            pdf.pdfUrl = `/api/study-pdfs/${pdf._id}/proxy`;
            await pdf.save();

            return NextResponse.json(pdf, { status: 201 });
        }

        // 3. Fallback for JSON metadata
        const body = await request.json().catch(() => null);
        if (!body || !body.title) {
            return NextResponse.json({ error: "title is required" }, { status: 400 });
        }

        const count = await StudyPdf.countDocuments({ userId });
        const color = COLORS[count % COLORS.length];

        const pdf = await StudyPdf.create({
            userId,
            title: body.title,
            category: body.category || "General",
            pdfUrl: body.pdfUrl || "",
            publicId: body.publicId || "",
            fileId: body.fileId || "",
            fileSize: body.fileSize || 0,
            totalPages: body.totalPages || 1,
            lastPage: 1,
            color,
            notes: [],
        });

        if (!pdf.pdfUrl) {
            pdf.pdfUrl = `/api/study-pdfs/${pdf._id}/proxy`;
            await pdf.save();
        }

        return NextResponse.json(pdf, { status: 201 });
    } catch (err: unknown) {
        console.error("POST /api/study-pdfs error:", err);
        const msg = err instanceof Error ? err.message : "Failed to upload and store PDF";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
