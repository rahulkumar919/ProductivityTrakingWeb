import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { TimeSession } from "@/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  return NextResponse.json(await TimeSession.find({ userId: user.userId }).sort({ startedAt: -1 }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const body = await request.json();
  const session = await TimeSession.create({ ...body, userId: user.userId });
  await logActivity(user.userId, `${body.mode} Completed`, `${body.durationMinutes} minutes logged`);
  return NextResponse.json(session, { status: 201 });
}
