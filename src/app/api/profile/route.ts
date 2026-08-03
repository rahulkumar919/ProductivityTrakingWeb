import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";

/** Resolve MongoDB userId from either auth system */
async function resolveUserId(): Promise<string | null> {
  // 1. Try custom JWT cookie (credentials login)
  const jwtUser = await getCurrentUser();
  if (jwtUser?.userId) return jwtUser.userId;

  // 2. Try NextAuth session (Google login)
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (sessionUser?.id) return sessionUser.id;

  return null;
}

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const profile = await User.findById(userId).select("-passwordHash");
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const body = await request.json();
  await User.updateOne({ _id: userId }, body);
  return NextResponse.json({ ok: true });
}
