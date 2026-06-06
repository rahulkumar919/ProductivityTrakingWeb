"use client";

import { Check, Flame } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { demoHabits } from "@/data/demo";

export function HabitTracker() {
  const [habits, setHabits] = useState(demoHabits);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {habits.map((habit) => (
        <Card key={habit.id}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{habit.title}</h3>
            <button aria-label="Check habit" title="Check habit" onClick={() => setHabits((current) => current.map((item) => item.id === habit.id ? { ...item, completedToday: true, streak: item.completedToday ? item.streak : item.streak + 1 } : item))} className={`grid size-9 place-items-center rounded-md border ${habit.completedToday ? "bg-primary text-primary-foreground" : ""}`}><Check size={16} /></button>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div><p className="text-sm text-muted-foreground">Current Streak</p><p className="text-3xl font-bold">{habit.streak}</p></div>
            <div className="flex items-center gap-1 text-sm text-accent"><Flame size={16} /> Best {habit.longestStreak}</div>
          </div>
          <div className="mt-5 grid grid-cols-6 gap-1">
            {habit.monthlyHistory.map((done, index) => <span key={index} className={`h-6 rounded ${done ? "bg-primary" : "bg-muted"}`} />)}
          </div>
        </Card>
      ))}
    </div>
  );
}
