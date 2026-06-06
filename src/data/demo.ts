import type { ActivityLog, Goal, Habit, RoutineItem, Task, TimeSession } from "@/types";

export const demoTasks: Task[] = [
  { id: "1", title: "Solve 5 DSA problems", category: "Coding", priority: "High", deadline: "2026-06-07", status: "In Progress", description: "Arrays and two-pointer practice" },
  { id: "2", title: "Study operating systems", category: "Study", priority: "Medium", deadline: "2026-06-07", status: "Completed", description: "Process scheduling notes" },
  { id: "3", title: "Push dashboard feature", category: "Coding", priority: "High", deadline: "2026-06-08", status: "Todo", description: "Finish analytics cards" },
  { id: "4", title: "Leg day workout", category: "Gym", priority: "Medium", deadline: "2026-06-07", status: "Completed", description: "Squats, lunges, calves" },
];

export const demoHabits: Habit[] = [
  { id: "h1", title: "Coding", streak: 18, longestStreak: 31, completedToday: true, monthlyHistory: [true, true, false, true, true, true, true, true, false, true, true, true] },
  { id: "h2", title: "DSA Practice", streak: 7, longestStreak: 14, completedToday: false, monthlyHistory: [true, false, true, true, true, false, true, true, true, true, false, true] },
  { id: "h3", title: "Gym", streak: 4, longestStreak: 12, completedToday: true, monthlyHistory: [false, true, true, false, true, true, true, false, true, true, false, true] },
  { id: "h4", title: "Reading", streak: 9, longestStreak: 21, completedToday: true, monthlyHistory: [true, true, true, true, false, true, true, true, true, false, true, true] },
];

export const demoGoals: Goal[] = [
  { id: "g1", title: "Study 3 hours", period: "Daily", progress: 68, deadline: "2026-06-07" },
  { id: "g2", title: "Complete React module", period: "Weekly", progress: 74, deadline: "2026-06-13" },
  { id: "g3", title: "Build portfolio feature", period: "Monthly", progress: 42, deadline: "2026-06-30" },
];

export const demoRoutine: RoutineItem[] = [
  { id: "r1", title: "Wake Up", targetTime: "06:00", completed: true },
  { id: "r2", title: "Exercise", targetTime: "06:30", completed: true },
  { id: "r3", title: "Study", targetTime: "08:00", completed: true },
  { id: "r4", title: "Coding Practice", targetTime: "15:00", completed: false },
  { id: "r5", title: "Gym", targetTime: "18:30", completed: true },
  { id: "r6", title: "Reading", targetTime: "22:00", completed: false },
];

export const demoActivities: ActivityLog[] = [
  { id: "a1", type: "Task Completed", description: "Completed operating systems study block", createdAt: "2026-06-07T09:20:00.000Z" },
  { id: "a2", type: "Coding Session Completed", description: "90 minutes on Next.js dashboard", createdAt: "2026-06-07T12:05:00.000Z" },
  { id: "a3", type: "Gym Session Completed", description: "Logged leg day workout", createdAt: "2026-06-07T19:15:00.000Z" },
  { id: "a4", type: "Habit Completed", description: "Reading habit checked in", createdAt: "2026-06-07T22:10:00.000Z" },
];

export const demoSessions: TimeSession[] = [
  { id: "s1", mode: "Coding Session", taskTitle: "Dashboard feature", durationMinutes: 130, startedAt: "2026-06-07T10:00:00.000Z", endedAt: "2026-06-07T12:10:00.000Z" },
  { id: "s2", mode: "Study Session", taskTitle: "Operating systems", durationMinutes: 95, startedAt: "2026-06-07T07:30:00.000Z", endedAt: "2026-06-07T09:05:00.000Z" },
  { id: "s3", mode: "Deep Work", taskTitle: "DSA practice", durationMinutes: 70, startedAt: "2026-06-06T16:00:00.000Z", endedAt: "2026-06-06T17:10:00.000Z" },
];

export const productivitySeries = [
  { name: "Mon", productivity: 72, coding: 2.5, study: 2, gym: 1 },
  { name: "Tue", productivity: 84, coding: 3.2, study: 2.4, gym: 0 },
  { name: "Wed", productivity: 63, coding: 1.8, study: 1.5, gym: 1 },
  { name: "Thu", productivity: 91, coding: 4.1, study: 3, gym: 1 },
  { name: "Fri", productivity: 78, coding: 2.9, study: 2.1, gym: 0 },
  { name: "Sat", productivity: 88, coding: 3.8, study: 2.6, gym: 1 },
  { name: "Sun", productivity: 76, coding: 2.2, study: 2.8, gym: 1 },
];
