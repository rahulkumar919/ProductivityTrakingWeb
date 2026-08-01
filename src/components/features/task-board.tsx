"use client";

import { BookOpen, ChevronDown, ChevronUp, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { LearningLog } from "@/components/features/learning-log";
import type { Category, Priority, Task, TaskStatus } from "@/types";

const STORAGE_KEY = "devtrack_tasks";
const ACTIVITY_KEY = "devtrack_activities";

function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    console.warn("localStorage full — could not save tasks.");
  }
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  // Load from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || task.status === status;
    const matchesCategory = category === "All" || task.category === category;
    return matchesQuery && matchesStatus && matchesCategory;
  }), [tasks, query, status, category]);

  function updateAndSave(updater: (current: Task[]) => Task[]) {
    setTasks((current) => {
      const next = updater(current);
      saveTasks(next);
      return next;
    });
  }

  function addTask(formData: FormData) {
    const title = String(formData.get("title"));
    updateAndSave((current) => [{
      id: crypto.randomUUID(),
      title,
      description: String(formData.get("description") ?? ""),
      category: formData.get("category") as Category,
      priority: formData.get("priority") as Priority,
      deadline: String(formData.get("deadline")),
      status: "Todo" as TaskStatus,
    }, ...current]);
    appendActivity("Task Created", `Created task: ${title}`);
  }

  function toggleLog(taskId: string) {
    setOpenLogId((prev) => (prev === taskId ? null : taskId));
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
        {/* filter bar */}
        <Card className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
            <Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option><option>Todo</option><option>In Progress</option><option>Completed</option>
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All</option><option>Coding</option><option>Study</option><option>College</option><option>Gym</option><option>Personal</option><option>Other</option>
          </Select>
        </Card>

        {/* empty state */}
        {hydrated && tasks.length === 0 && (
          <Card className="py-12 text-center">
            <SlidersHorizontal size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first task using the form on the left.</p>
          </Card>
        )}

        {/* task cards */}
        <div className="grid gap-3">
          {filtered.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <div className="grid gap-3 md:grid-cols-[1fr_160px_150px_auto_40px] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-primary" />
                    <h3 className="font-semibold">{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{task.category}</span>
                    <span>{task.priority}</span>
                    <span>{task.deadline}</span>
                  </div>
                </div>
                <Select
                  value={task.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TaskStatus;
                    updateAndSave((current) =>
                      current.map((item) =>
                        item.id === task.id ? { ...item, status: newStatus } : item
                      )
                    );
                    if (newStatus === "Completed") {
                      appendActivity("Task Completed", `Completed task: ${task.title}`);
                    }
                  }}
                >
                  <option>Todo</option><option>In Progress</option><option>Completed</option>
                </Select>
                <span className="rounded-md bg-muted px-3 py-2 text-center text-sm">{task.status}</span>

                {/* Learning Log toggle */}
                <button
                  onClick={() => toggleLog(task.id)}
                  title="Learning Log"
                  aria-label="Toggle learning log"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                  style={{
                    background: openLogId === task.id ? "var(--primary)" : "var(--muted)",
                    color: openLogId === task.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <BookOpen size={13} />
                  Learn Log
                  {openLogId === task.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <button
                  aria-label="Delete task"
                  title="Delete task"
                  onClick={() => {
                    updateAndSave((current) => current.filter((item) => item.id !== task.id));
                    appendActivity("Task Deleted", `Deleted task: ${task.title}`);
                  }}
                  className="grid size-10 place-items-center rounded-md border hover:bg-muted"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Learning Log panel */}
              {openLogId === task.id && (
                <div className="border-t px-1 pb-2" style={{ borderColor: "var(--border)" }}>
                  <LearningLog taskId={task.id} taskTitle={task.title} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
