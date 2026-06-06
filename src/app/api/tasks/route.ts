import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { taskSchema } from "@/lib/validators";
import { Task } from "@/models";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  return NextResponse.json(await Task.find({ userId: user.userId }).sort({ deadline: 1 }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const parsed = taskSchema.parse(await request.json());
  const task = await Task.create({ ...parsed, userId: user.userId });
  await logActivity(user.userId, "Task Created", `Created task: ${task.title}`);
  return NextResponse.json(task, { status: 201 });
}
