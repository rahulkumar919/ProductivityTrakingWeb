import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { StudyPdf } from "@/models";
import { deleteFileFromGridFS } from "@/lib/gridfs";
import { env } from "@/lib/env";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

/**
 * Delete legacy file from Cloudinary (for any old uploads)
 */
async function deleteFromCloudinary(publicId: string): Promise<void> {
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign + env.cloudinaryApiSecret);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", env.cloudinaryApiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    await fetch(
        `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/raw/destroy`,
        { method: "POST", body: form }
    );
}

/* PATCH — update progress, totalPages, or add/delete notes */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const pdf = await StudyPdf.findOne({ _id: id, userId });
    if (!pdf) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json() as {
        lastPage?: number;
        totalPages?: number;
        addNote?: { id: string; page: number; text: string; createdAt: string };
        deleteNoteId?: string;
    };

    if (body.lastPage !== undefined) pdf.lastPage = Math.max(pdf.lastPage, body.lastPage);
    if (body.totalPages !== undefined && body.totalPages > pdf.totalPages) pdf.totalPages = body.totalPages;
    if (body.addNote) pdf.notes.push(body.addNote);
    if (body.deleteNoteId) pdf.notes = pdf.notes.filter((n: { id: string }) => n.id !== body.deleteNoteId);

    await pdf.save();
    return NextResponse.json(pdf);
}

/* DELETE — remove PDF from Database (GridFS + Document) */
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const pdf = await StudyPdf.findOne({ _id: id, userId });
    if (!pdf) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 1. Delete from MongoDB GridFS if fileId exists
    if (pdf.fileId) {
        await deleteFileFromGridFS(pdf.fileId);
    }

    // 2. Delete from Cloudinary if legacy publicId exists
    if (pdf.publicId) {
        try {
            await deleteFromCloudinary(pdf.publicId as string);
        } catch (err) {
            console.warn("Cloudinary delete failed (non-fatal):", err);
        }
    }

    // 3. Remove document from database
    await StudyPdf.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
}
