import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { Notebook } from "@/models";

/* POST /api/notebooks/:id/pages — upload image(s), add pages */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const notebook = await Notebook.findOne({ _id: id, userId: user.userId });
    if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json() as { images: { data: string; caption?: string }[] };
    if (!body.images?.length) return NextResponse.json({ error: "No images provided" }, { status: 400 });

    const currentMax = notebook.pages.reduce((m: number, p: { pageNumber: number }) => Math.max(m, p.pageNumber), 0);
    const newPages = [];

    for (let i = 0; i < body.images.length; i++) {
        const { data, caption = "" } = body.images[i];
        const { publicId, url } = await uploadToCloudinary(data, `devtrack/notebooks/${id}`);
        newPages.push({
            pageNumber: currentMax + i + 1,
            cloudinaryId: publicId,
            imageUrl: url,
            caption,
        });
    }

    notebook.pages.push(...newPages);
    await notebook.save();
    return NextResponse.json(notebook, { status: 201 });
}

/* DELETE /api/notebooks/:id/pages?cloudinaryId=xxx — remove a single page */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const url = new URL(request.url);
    const cloudinaryId = url.searchParams.get("cloudinaryId");
    if (!cloudinaryId) return NextResponse.json({ error: "cloudinaryId required" }, { status: 400 });

    const notebook = await Notebook.findOne({ _id: id, userId: user.userId });
    if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteFromCloudinary(cloudinaryId);
    notebook.pages = notebook.pages.filter((p: { cloudinaryId: string }) => p.cloudinaryId !== cloudinaryId);
    // Re-number pages
    notebook.pages.forEach((p: { pageNumber: number }, i: number) => { p.pageNumber = i + 1; });
    await notebook.save();
    return NextResponse.json(notebook);
}
