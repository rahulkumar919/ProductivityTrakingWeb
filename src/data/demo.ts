// Demo data cleared — all data is now created fresh by the user.
import type { ActivityLog, Goal, Habit, RoutineItem, Task, TimeSession } from "@/types";

export const demoTasks: Task[] = [];
export const demoHabits: Habit[] = [];
export const demoGoals: Goal[] = [];
export const demoRoutine: RoutineItem[] = [];
export const demoActivities: ActivityLog[] = [];
export const demoSessions: TimeSession[] = [];

export const productivitySeries: Array<{
  name: string;
  productivity: number;
  coding: number;
  study: number;
  gym: number;
}> = [];
