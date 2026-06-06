"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { demoRoutine } from "@/data/demo";

export function RoutinePlanner() {
  const [items, setItems] = useState(demoRoutine);
  const completion = useMemo(() => Math.round((items.filter((item) => item.completed).length / items.length) * 100), [items]);

  function addItem(formData: FormData) {
    setItems((current) => [...current, { id: crypto.randomUUID(), title: String(formData.get("title")), targetTime: String(formData.get("targetTime")), completed: false }]);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Daily Consistency</h2>
        <div className="mt-5 text-5xl font-bold">{completion}%</div>
        <div className="mt-4 h-3 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} /></div>
        <form action={addItem} className="mt-6 space-y-3">
          <Label>Routine<Input name="title" required placeholder="Sleep" /></Label>
          <Label>Target time<Input name="targetTime" required type="time" /></Label>
          <Button className="w-full"><Plus size={16} /> Add Routine</Button>
        </form>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.targetTime}</p>
            </div>
            <button aria-label="Toggle routine" title="Toggle routine" onClick={() => setItems((current) => current.map((routine) => routine.id === item.id ? { ...routine, completed: !routine.completed } : routine))} className={`grid size-10 place-items-center rounded-md border ${item.completed ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <Check size={17} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
