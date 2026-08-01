"use client";

import { Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import type { Goal, GoalPeriod } from "@/types";

const STORAGE_KEY = "devtrack_goals";
const ACTIVITY_KEY = "devtrack_activities";

function load(): Goal[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(goals: Goal[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch { /* ignore */ }
}
function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

export function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setGoals(load()); setHydrated(true); }, []);

  function update(updater: (g: Goal[]) => Goal[]) {
    setGoals((current) => { const next = updater(current); save(next); return next; });
  }

  function addGoal(formData: FormData) {
    const title = String(formData.get("title"));
    const goal: Goal = {
      id: crypto.randomUUID(),
      title,
      period: formData.get("period") as GoalPeriod,
      progress: Number(formData.get("progress")),
      deadline: String(formData.get("deadline")),
    };
    update((current) => [goal, ...current]);
    appendActivity("Goal Created", `Created goal: ${title}`);
  }

  function updateProgress(id: string, progress: number) {
    update((current) => current.map((g) => g.id === id ? { ...g, progress } : g));
    const goal = goals.find((g) => g.id === id);
    if (goal && progress >= 100) {
      appendActivity("Goal Completed", `Completed goal: ${goal.title}`);
    }
  }

  function deleteGoal(id: string) {
    update((current) => current.filter((g) => g.id !== id));
  }

  if (!hydrated) return null;

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Create Goal</h2>
        <form action={addGoal} className="mt-4 space-y-3">
          <Label>Title<Input name="title" required placeholder="Solve 5 DSA problems" /></Label>
          <Label>Period
            <Select name="period">
              <option>Daily</option><option>Weekly</option><option>Monthly</option>
            </Select>
          </Label>
          <Label>Progress (%)
            <Input name="progress" required type="number" min="0" max="100" defaultValue="0" />
          </Label>
          <Label>Deadline<Input name="deadline" required type="date" /></Label>
          <Button className="w-full"><Plus size={16} /> Add Goal</Button>
        </form>
      </Card>

      <div className="grid gap-3">
        {goals.length === 0 ? (
          <Card className="py-12 text-center">
            <Target size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold">No goals yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first goal using the form on the left.</p>
          </Card>
        ) : goals.map((goal) => (
          <Card key={goal.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{goal.period} goal · Due {goal.deadline}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{goal.progress}%</span>
                <div className="flex items-center gap-1">
                  <input
                    type="range" min="0" max="100" value={goal.progress}
                    onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                    className="w-24 accent-primary"
                    aria-label="Update progress"
                  />
                  <button onClick={() => deleteGoal(goal.id)}
                    className="grid size-8 place-items-center rounded-md border hover:bg-muted"
                    aria-label="Delete goal"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goal.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
