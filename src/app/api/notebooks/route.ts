import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Notebook } from "@/models";

/* GET /api/notebooks — list all notebooks for the user */
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const notebooks = await Notebook.find({ userId: user.userId }).sort({ updatedAt: -1 });
    return NextResponse.json(notebooks);
}

/* POST /api/notebooks — create a new notebook */
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectToDatabase();
    const body = await request.json();
    const notebook = await Notebook.create({
        userId: user.userId,
        title: body.title,
        subject: body.subject ?? "General",
        description: body.description ?? "",
        color: body.color ?? "#6366f1",
        emoji: body.emoji ?? "📓",
        pages: [],
    });
    return NextResponse.json(notebook, { status: 201 });
}
