"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { demoGoals } from "@/data/demo";
import type { GoalPeriod } from "@/types";

export function GoalManager() {
  const [goals, setGoals] = useState(demoGoals);
  function addGoal(formData: FormData) {
    setGoals((current) => [{ id: crypto.randomUUID(), title: String(formData.get("title")), period: formData.get("period") as GoalPeriod, progress: Number(formData.get("progress")), deadline: String(formData.get("deadline")) }, ...current]);
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Create Goal</h2>
        <form action={addGoal} className="mt-4 space-y-3">
          <Label>Title<Input name="title" required placeholder="Solve 5 DSA problems" /></Label>
          <Label>Period<Select name="period"><option>Daily</option><option>Weekly</option><option>Monthly</option></Select></Label>
          <Label>Progress<Input name="progress" required type="number" min="0" max="100" defaultValue="0" /></Label>
          <Label>Deadline<Input name="deadline" required type="date" /></Label>
          <Button className="w-full"><Plus size={16} /> Add Goal</Button>
        </form>
      </Card>
      <div className="grid gap-3">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="font-semibold">{goal.title}</h3><p className="text-sm text-muted-foreground">{goal.period} goal · Due {goal.deadline}</p></div>
              <span className="text-2xl font-bold">{goal.progress}%</span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
