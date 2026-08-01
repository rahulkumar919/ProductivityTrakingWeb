"use client";

import { Check, Plus, Trash2, Activity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import type { RoutineItem } from "@/types";

const STORAGE_KEY = "devtrack_routine";
const ACTIVITY_KEY = "devtrack_activities";

function load(): RoutineItem[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(items: RoutineItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}
function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

export function RoutinePlanner() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setItems(load()); setHydrated(true); }, []);

  const completion = useMemo(() =>
    items.length === 0 ? 0 : Math.round((items.filter((i) => i.completed).length / items.length) * 100),
    [items]
  );

  function update(updater: (r: RoutineItem[]) => RoutineItem[]) {
    setItems((current) => { const next = updater(current); save(next); return next; });
  }

  function addItem(formData: FormData) {
    update((current) => [...current, {
      id: crypto.randomUUID(),
      title: String(formData.get("title")),
      targetTime: String(formData.get("targetTime")),
      completed: false,
    }]);
  }

  function toggleItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (item && !item.completed) {
      appendActivity("Routine Completed", `Completed routine: ${item.title}`);
    }
    update((current) => current.map((r) => r.id === id ? { ...r, completed: !r.completed } : r));
  }

  function deleteItem(id: string) {
    update((current) => current.filter((r) => r.id !== id));
  }

  if (!hydrated) return null;

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Daily Consistency</h2>
        <div className="mt-5 text-5xl font-bold">{completion}%</div>
        <div className="mt-4 h-3 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
        <form action={addItem} className="mt-6 space-y-3">
          <Label>Routine<Input name="title" required placeholder="e.g. Sleep, Morning Run…" /></Label>
          <Label>Target time<Input name="targetTime" required type="time" /></Label>
          <Button className="w-full"><Plus size={16} /> Add Routine</Button>
        </form>
      </Card>

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <Activity size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">No routine items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your daily routine items using the form on the left.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.targetTime}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  aria-label="Toggle routine" title="Toggle routine"
                  onClick={() => toggleItem(item.id)}
                  className={`grid size-10 place-items-center rounded-md border ${item.completed ? "bg-primary text-primary-foreground" : "bg-card"}`}
                >
                  <Check size={17} />
                </button>
                <button
                  aria-label="Delete routine" title="Delete routine"
                  onClick={() => deleteItem(item.id)}
                  className="grid size-10 place-items-center rounded-md border hover:bg-muted"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
