import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { Notebook } from "@/models";

/* GET /api/notebooks/:id — get single notebook with all pages */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const notebook = await Notebook.findOne({ _id: id, userId: user.userId });
    if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(notebook);
}

/* PATCH /api/notebooks/:id — update title/subject/description */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const notebook = await Notebook.findOneAndUpdate(
        { _id: id, userId: user.userId },
        { $set: body },
        { new: true }
    );
    if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(notebook);
}

/* DELETE /api/notebooks/:id — delete notebook and all Cloudinary images */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const notebook = await Notebook.findOne({ _id: id, userId: user.userId });
    if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Delete all images from Cloudinary
    await Promise.allSettled(
        notebook.pages.map((p: { cloudinaryId: string }) => deleteFromCloudinary(p.cloudinaryId))
    );
    await notebook.deleteOne();
    return NextResponse.json({ ok: true });
}
