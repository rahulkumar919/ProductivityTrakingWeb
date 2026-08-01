"use client";

import { Activity, CheckCircle2, Clock, Code2, Dumbbell, Flame, ListTodo, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { HoursBar, ProductivityArea } from "@/components/charts/productivity-charts";
import type { Goal, Habit, RoutineItem, Task, TimeSession } from "@/types";

function load<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(load("devtrack_tasks"));
    setHabits(load("devtrack_habits"));
    setSessions(load("devtrack_sessions"));
    setRoutine(load("devtrack_routine"));
    setGoals(load("devtrack_goals"));
    setHydrated(true);
  }, []);

  const focusMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status !== "Completed").length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak ?? 0), 0);
  const codingMinutes = sessions.filter((s) => s.mode === "Coding Session").reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const studyMinutes = sessions.filter((s) => s.mode === "Study Session").reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

  function fmt(minutes: number) {
    if (minutes === 0) return "0m";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
  }

  const stats = [
    { label: "Tasks Completed", value: completed, icon: CheckCircle2 },
    { label: "Pending Tasks", value: pending, icon: ListTodo },
    { label: "Focus Time", value: fmt(focusMinutes), icon: Timer },
    { label: "Coding Time", value: fmt(codingMinutes), icon: Code2 },
    { label: "Study Time", value: fmt(studyMinutes), icon: Clock },
    { label: "Gym Sessions", value: sessions.filter((s) => s.mode === "Pomodoro").length, icon: Dumbbell },
    { label: "Best Streak", value: bestStreak > 0 ? `${bestStreak} days` : "—", icon: Flame },
    { label: "Goals Active", value: goals.length, icon: Activity },
  ];

  if (!hydrated) return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}><div className="h-14 animate-pulse rounded bg-muted" /></Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <CardTitle>{stat.label}</CardTitle>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold">{stat.value}</div>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && tasks.length === 0 ? (
        <Card className="py-12 text-center">
          <Activity size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">Welcome to DevTrack AI</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start by creating tasks, logging focus sessions, habits, and goals. Your analytics will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Weekly Progress</h2>
            <ProductivityArea data={[]} />
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Coding, Study, Gym</h2>
            <HoursBar data={[]} />
          </Card>
        </div>
      )}
    </div>
  );
}
