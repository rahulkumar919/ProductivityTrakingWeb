"use client";

import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { demoTasks } from "@/data/demo";
import type { Category, Priority, TaskStatus } from "@/types";

export function TaskBoard() {
  const [tasks, setTasks] = useState(demoTasks);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || task.status === status;
    const matchesCategory = category === "All" || task.category === category;
    return matchesQuery && matchesStatus && matchesCategory;
  }), [tasks, query, status, category]);

  function addTask(formData: FormData) {
    setTasks((current) => [{
      id: crypto.randomUUID(),
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? ""),
      category: formData.get("category") as Category,
      priority: formData.get("priority") as Priority,
      deadline: String(formData.get("deadline")),
      status: "Todo",
    }, ...current]);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Create Task</h2>
        <form action={addTask} className="mt-4 space-y-3">
          <Label>Title<Input required name="title" placeholder="Build project feature" /></Label>
          <Label>Description<Textarea name="description" placeholder="What needs to happen?" /></Label>
          <div className="grid grid-cols-2 gap-3">
            <Label>Category<Select name="category" defaultValue="Coding"><option>Coding</option><option>Study</option><option>College</option><option>Gym</option><option>Personal</option><option>Other</option></Select></Label>
            <Label>Priority<Select name="priority" defaultValue="High"><option>Low</option><option>Medium</option><option>High</option></Select></Label>
          </div>
          <Label>Deadline<Input required name="deadline" type="date" /></Label>
          <Button className="w-full">Add Task</Button>
        </form>
      </Card>
      <div className="space-y-4">
        <Card className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative"><Search className="absolute left-3 top-3 text-muted-foreground" size={16} /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" /></div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Todo</option><option>In Progress</option><option>Completed</option></Select>
          <Select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option><option>Coding</option><option>Study</option><option>College</option><option>Gym</option><option>Personal</option><option>Other</option></Select>
        </Card>
        <div className="grid gap-3">
          {filtered.map((task) => (
            <Card key={task.id} className="grid gap-3 md:grid-cols-[1fr_160px_150px_40px] md:items-center">
              <div>
                <div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-primary" /><h3 className="font-semibold">{task.title}</h3></div>
                <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{task.category}</span><span>{task.priority}</span><span>{task.deadline}</span></div>
              </div>
              <Select value={task.status} onChange={(event) => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: event.target.value as TaskStatus } : item))}>
                <option>Todo</option><option>In Progress</option><option>Completed</option>
              </Select>
              <span className="rounded-md bg-muted px-3 py-2 text-center text-sm">{task.status}</span>
              <button aria-label="Delete task" title="Delete task" onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} className="grid size-10 place-items-center rounded-md border hover:bg-muted"><Trash2 size={16} /></button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
