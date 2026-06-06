import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { goalSchema } from "@/lib/validators";
import { Goal } from "@/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  return NextResponse.json(await Goal.find({ userId: user.userId }).sort({ deadline: 1 }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const parsed = goalSchema.parse(await request.json());
  return NextResponse.json(await Goal.create({ ...parsed, userId: user.userId, completed: parsed.progress >= 100 }), { status: 201 });
}
