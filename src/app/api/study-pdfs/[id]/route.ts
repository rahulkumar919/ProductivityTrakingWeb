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

/* DELETE — remove PDF from DB + Cloudinary */
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

    // Delete from Cloudinary
    try {
        await cloudinary.v2.uploader.destroy(pdf.publicId, { resource_type: "raw" });
    } catch { /* non-fatal */ }

    await StudyPdf.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
}
