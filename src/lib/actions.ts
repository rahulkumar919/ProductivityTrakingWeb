"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { Goal, Habit, Routine, Task, TimeSession, User } from "@/models";
import { goalSchema, taskSchema } from "@/lib/validators";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  await connectToDatabase();
  return user;
}

export async function createTaskAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = taskSchema.parse(Object.fromEntries(formData));
  const task = await Task.create({ ...parsed, userId: user.userId });
  await logActivity(user.userId, "Task Created", `Created task: ${task.title}`);
  revalidatePath("/tasks");
  return { ok: true };
}

export async function updateTaskStatusAction(id: string, status: string) {
  const user = await requireUser();
  const task = await Task.findOneAndUpdate({ _id: id, userId: user.userId }, { status }, { new: true });
  if (task && status === "Completed") await logActivity(user.userId, "Task Completed", `Completed task: ${task.title}`);
  revalidatePath("/tasks");
}

export async function deleteTaskAction(id: string) {
  const user = await requireUser();
  await Task.deleteOne({ _id: id, userId: user.userId });
  await logActivity(user.userId, "Task Deleted", "Deleted a task");
  revalidatePath("/tasks");
}

export async function createGoalAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = goalSchema.parse(Object.fromEntries(formData));
  await Goal.create({ ...parsed, userId: user.userId, completed: parsed.progress >= 100 });
  await logActivity(user.userId, "Goal Created", `Created goal: ${parsed.title}`);
  revalidatePath("/goals");
  return { ok: true };
}

export async function checkHabitAction(id: string) {
  const user = await requireUser();
  const habit = await Habit.findOne({ _id: id, userId: user.userId });
  if (!habit) return;
  habit.checkIns.push({ date: new Date(), completed: true });
  habit.streak += 1;
  habit.longestStreak = Math.max(habit.longestStreak, habit.streak);
  await habit.save();
  await logActivity(user.userId, "Habit Completed", `Completed habit: ${habit.title}`);
  revalidatePath("/habits");
}

export async function toggleRoutineAction(id: string) {
  const user = await requireUser();
  const routine = await Routine.findOne({ _id: id, userId: user.userId });
  if (!routine) return;
  routine.completedDates.push(new Date());
  await routine.save();
  await logActivity(user.userId, "Routine Completed", `Completed routine item: ${routine.title}`);
  revalidatePath("/routine");
}

export async function saveFocusSessionAction(formData: FormData) {
  const user = await requireUser();
  const payload = Object.fromEntries(formData);
  await TimeSession.create({
    userId: user.userId,
    mode: payload.mode,
    taskTitle: payload.taskTitle,
    startedAt: payload.startedAt,
    endedAt: payload.endedAt,
    durationMinutes: Number(payload.durationMinutes),
  });
  await logActivity(user.userId, "Focus Session Completed", `${payload.mode} for ${payload.durationMinutes} minutes`);
  revalidatePath("/timer");
}

export async function updateProfileAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  await User.updateOne(
    { _id: user.userId },
    {
      name: formData.get("name"),
      profession: formData.get("profession"),
      dailyTargetStudyHours: Number(formData.get("dailyTargetStudyHours")),
      dailyTargetCodingHours: Number(formData.get("dailyTargetCodingHours")),
      dailyTargetGymTime: Number(formData.get("dailyTargetGymTime")),
    }
  );
  revalidatePath("/profile");
  return { ok: true };
}
