"use client";

import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import type { Habit } from "@/types";

const STORAGE_KEY = "devtrack_habits";
const ACTIVITY_KEY = "devtrack_activities";

function load(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function save(habits: Habit[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch { /* ignore */ }
}
function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHabits(load()); setHydrated(true); }, []);

  function update(updater: (h: Habit[]) => Habit[]) {
    setHabits((current) => { const next = updater(current); save(next); return next; });
  }

  function addHabit(formData: FormData) {
    const title = String(formData.get("title"));
    if (!title.trim()) return;
    update((current) => [...current, {
      id: crypto.randomUUID(), title: title.trim(), streak: 0,
      longestStreak: 0, completedToday: false, monthlyHistory: [],
    }]);
  }

  function checkHabit(id: string) {
    update((current) => current.map((h) => {
      if (h.id !== id || h.completedToday) return h;
      const streak = h.streak + 1;
      appendActivity("Habit Completed", `Completed habit: ${h.title} · streak ${streak}`);
      return { ...h, completedToday: true, streak, longestStreak: Math.max(h.longestStreak, streak), monthlyHistory: [...h.monthlyHistory, true].slice(-30) };
    }));
  }

  function deleteHabit(id: string) {
    update((current) => current.filter((h) => h.id !== id));
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-5">
      {/* Add habit form */}
      <Card>
        <h2 className="text-lg font-semibold">Add Habit</h2>
        <form action={addHabit} className="mt-4 flex gap-3">
          <Label className="flex-1">
            <Input name="title" required placeholder="e.g. Coding, DSA Practice, Reading…" />
          </Label>
          <Button type="submit"><Plus size={16} /> Add</Button>
        </form>
      </Card>

      {habits.length === 0 ? (
        <Card className="py-12 text-center">
          <Flame size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">No habits yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a habit above to start tracking your streaks.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{habit.title}</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Check habit" title="Check habit"
                    onClick={() => checkHabit(habit.id)}
                    className={`grid size-9 place-items-center rounded-md border ${habit.completedToday ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    aria-label="Delete habit" title="Delete habit"
                    onClick={() => deleteHabit(habit.id)}
                    className="grid size-9 place-items-center rounded-md border hover:bg-muted"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold">{habit.streak}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-accent">
                  <Flame size={16} /> Best {habit.longestStreak}
                </div>
              </div>
              {habit.monthlyHistory.length > 0 && (
                <div className="mt-5 grid grid-cols-10 gap-1">
                  {habit.monthlyHistory.slice(-30).map((done, i) => (
                    <span key={i} className={`h-4 rounded ${done ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
