"use client";

import {
  AlertCircle, Bell, Calendar, CheckCircle2, ChevronDown,
  Circle, Clock, Filter, MoreVertical, Plus, Search,
  Trash2, TrendingUp, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { Category, Priority, Task, TaskStatus } from "@/types";

/* ─── storage ──────────────────────────────────────────────────── */
const STORAGE_KEY = "devtrack_tasks";
const ACTIVITY_KEY = "devtrack_activities";

function loadTasks(): Task[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveTasks(t: Task[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* ignore */ }
}
function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const ex = raw ? JSON.parse(raw) : [];
    ex.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(ex.slice(0, 200)));
  } catch { /* ignore */ }
}

/* ─── constants ────────────────────────────────────────────────── */
const PRIORITY_COLOR2: Record<Priority, string> = {
  High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e",
};
const PRIORITY_BG2: Record<Priority, string> = {
  High: "rgba(239,68,68,0.1)", Medium: "rgba(245,158,11,0.1)", Low: "rgba(34,197,94,0.1)",
};
const STATUS_COLOR2: Record<TaskStatus, string> = {
  "Completed": "#22c55e", "In Progress": "#6366f1", "Todo": "#f59e0b",
};
const CAT_COLOR2: Record<string, string> = {
  Coding: "#6366f1", Study: "#f59e0b", College: "#14b8a6",
  Gym: "#ef4444", Personal: "#8b5cf6", Other: "#aeb7a7",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
/* ─── Add Task Modal ───────────────────────────────────────────── */
function AddTaskModal({ onAdd, onClose }: { onAdd: (t: Task) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<Category>("Coding");
  const [priority, setPriority] = useState<Priority>("High");
  const [deadline, setDeadline] = useState("");
  const [time, setTime] = useState("08:00");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onAdd({ id: crypto.randomUUID(), title: title.trim(), description: desc.trim(), category: cat, priority, deadline, status: "Todo" });
    onClose();
  }

  return (
    <div className="tb-overlay" onClick={onClose}>
      <div className="tb-modal" onClick={e => e.stopPropagation()}>
        <div className="tb-modal-hd">
          <div><h2 className="tb-modal-title">Add New Task</h2><p className="tb-modal-sub">Plan, prioritize, execute.</p></div>
          <button onClick={onClose} className="tb-icon-btn"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="tb-modal-body">
          <div className="tb-field"><label className="tb-label">Task Title *</label>
            <input className="tb-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build AI Agent (MCP Server)" required autoFocus /></div>
          <div className="tb-field"><label className="tb-label">Description</label>
            <textarea className="tb-input tb-ta" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What needs to happen?" rows={2} /></div>
          <div className="tb-row2">
            <div className="tb-field"><label className="tb-label">Category</label>
              <select className="tb-input" value={cat} onChange={e => setCat(e.target.value as Category)}>
                <option>Coding</option><option>Study</option><option>College</option><option>Gym</option><option>Personal</option><option>Other</option>
              </select></div>
            <div className="tb-field"><label className="tb-label">Priority</label>
              <select className="tb-input" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select></div>
          </div>
          <div className="tb-row2">
            <div className="tb-field"><label className="tb-label">Deadline *</label>
              <input className="tb-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required /></div>
            <div className="tb-field"><label className="tb-label">Time</label>
              <input className="tb-input" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>
          <div className="tb-modal-ft">
            <button type="button" onClick={onClose} className="tb-btn-ghost">Cancel</button>
            <button type="submit" className="tb-btn-primary"><Plus size={15} /> Add Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */

function StatCard({ label, value, sub, color, bg, icon: Icon, ring }: {
  label: string; value: string | number; sub: string; color: string; bg: string; icon: React.ElementType; ring?: boolean;
}) {
  const pct = ring ? Number(String(value).replace(/[^0-9]/g, "")) : 0;
  return (
    <div className="tb-stat">
      <div className="tb-stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
      <div className="tb-stat-info">
        <p className="tb-stat-label">{label}</p>
        <p className="tb-stat-value">{value}</p>
        <p className="tb-stat-sub">{sub}</p>
      </div>
      {ring && (
        <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
          <circle cx={26} cy={26} r={21} fill="none" stroke="var(--muted)" strokeWidth={4} />
          <circle cx={26} cy={26} r={21} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={`${2 * Math.PI * 21 * pct / 100} 999`}
            strokeLinecap="round" transform="rotate(-90 26 26)" />
        </svg>
      )}
    </div>
  );
}

/* ─── Task Row ─────────────────────────────────────────────────── */
function TaskRow({ task, onStatus, onDelete }: {
  task: Task; onStatus: (id: string, s: TaskStatus) => void; onDelete: (id: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const overdue = task.status !== "Completed" && task.deadline && new Date(task.deadline) < new Date();
  const statusCycle: TaskStatus[] = ["Todo", "In Progress", "Completed"];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className={`tb-task-row ${task.status === "Completed" ? "tb-done" : ""}`}>
      <button onClick={() => onStatus(task.id, statusCycle[(statusCycle.indexOf(task.status) + 1) % 3])}
        className="tb-circle-btn" style={{ color: STATUS_COLOR2[task.status] }} aria-label="toggle status">
        {task.status === "Completed" ? <CheckCircle2 size={20} fill={STATUS_COLOR2[task.status]} />
          : task.status === "In Progress" ? <Circle size={20} style={{ strokeDasharray: "44 14" }} />
            : <Circle size={20} />}
      </button>
      <div className="tb-task-body">
        <p className="tb-task-title" style={{ textDecoration: task.status === "Completed" ? "line-through" : "none", opacity: task.status === "Completed" ? 0.55 : 1 }}>
          {task.title}
        </p>
        <div className="tb-task-tags">
          <span className="tb-tag" style={{ background: `${CAT_COLOR2[task.category] ?? "#aeb7a7"}18`, color: CAT_COLOR2[task.category] ?? "#aeb7a7" }}>{task.category}</span>
          <span className="tb-tag" style={{ background: PRIORITY_BG2[task.priority], color: PRIORITY_COLOR2[task.priority] }}>{task.priority}</span>
        </div>
      </div>
      <span className="tb-task-time">{task.deadline ? `${fmtDate(task.deadline)}` : "—"}</span>
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setMenu(v => !v)} className="tb-icon-btn" aria-label="options"><MoreVertical size={16} /></button>
        {menu && (
          <div className="tb-dropdown">
            {statusCycle.filter(s => s !== task.status).map(s => (
              <button key={s} onClick={() => { onStatus(task.id, s); setMenu(false); }} className="tb-dd-item">Mark as {s}</button>
            ))}
            <button onClick={() => { onDelete(task.id); setMenu(false); }} className="tb-dd-item tb-dd-danger"><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Productivity Line Chart ──────────────────────────────────── */
function TrendChart({ tasks }: { tasks: Task[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const completed = tasks.filter(t => t.status === "Completed").length;
  const data = days.map((day, i) => ({ day, tasks: Math.max(0, Math.round(completed * (i + 1) / 7) + (i % 3 === 0 ? 2 : 0)) }));
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
        <Line type="monotone" dataKey="tasks" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} activeDot={{ r: 5 }} name="Tasks" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Main Export ──────────────────────────────────────────────── */
export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All" | "Today" | "Upcoming" | "Overdue">("Today");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [prioFilter, setPrioFilter] = useState("All Priorities");
  const [showCatDD, setShowCatDD] = useState(false);
  const [showPrioDD, setShowPrioDD] = useState(false);
  const nowMs = useMemo(() => Date.now(), []);

  useEffect(() => { setTasks(loadTasks()); setHydrated(true); }, []);

  const update = useCallback((fn: (prev: Task[]) => Task[]) => {
    setTasks(prev => { const next = fn(prev); saveTasks(next); return next; });
  }, []);

  function addTask(t: Task) {
    update(prev => [t, ...prev]);
    appendActivity("Task Created", `Created task: ${t.title}`);
  }

  function onStatus(id: string, s: TaskStatus) {
    update(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
    if (s === "Completed") {
      const t = tasks.find(x => x.id === id);
      if (t) appendActivity("Task Completed", `Completed: ${t.title}`);
    }
  }

  function onDelete(id: string) {
    const t = tasks.find(x => x.id === id);
    update(prev => prev.filter(t => t.id !== id));
    if (t) appendActivity("Task Deleted", `Deleted: ${t.title}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchQ = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "All Categories" || t.category === catFilter;
      const matchPrio = prioFilter === "All Priorities" || t.priority === prioFilter;
      const matchTab = tab === "All" ? true
        : tab === "Today" ? t.deadline === today
          : tab === "Upcoming" ? t.deadline > today
            : tab === "Overdue" ? (t.deadline < today && t.status !== "Completed")
              : true;
      return matchQ && matchCat && matchPrio && matchTab;
    });
  }, [tasks, search, catFilter, prioFilter, tab, today]);

  const todayTasks = filtered.filter(t => t.deadline === today);
  const tomorrowTasks = filtered.filter(t => t.deadline === tomorrow);
  const otherTasks = filtered.filter(t => t.deadline !== today && t.deadline !== tomorrow);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const pending = tasks.filter(t => t.status === "Todo").length;
  const overdue = tasks.filter(t => t.deadline < today && t.status !== "Completed").length;
  const total = tasks.length;
  const pctDone = total ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { name: "Completed", value: completed, color: "#22c55e" },
    { name: "In Progress", value: inProgress, color: "#6366f1" },
    { name: "Pending", value: pending, color: "#f59e0b" },
    { name: "Overdue", value: overdue, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const catBreakdown = Object.entries(
    tasks.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const upcoming = tasks.filter(t => t.status !== "Completed" && t.deadline >= today)
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);

  const recent = tasks.filter(t => t.status === "Completed").slice(0, 3);

  if (!hydrated) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />)}</div>;

  return (
    <>
      {showAdd && <AddTaskModal onAdd={addTask} onClose={() => setShowAdd(false)} />}

      {/* ── Top header row ── */}
      <div className="tb-top">
        <div />
        <div className="tb-top-actions">
          <button onClick={() => setShowAdd(true)} className="tb-btn-primary"><Plus size={16} /> Add Task</button>
          <button className="tb-icon-btn tb-icon-outline"><Calendar size={16} /></button>
          <button className="tb-icon-btn tb-icon-outline"><TrendingUp size={16} /></button>
          <button className="tb-icon-btn tb-icon-outline"><Filter size={16} /></button>
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div className="tb-stats-grid">
        <StatCard label="Total Tasks" value={total} sub={`↑ 18% vs last week`} color="#16614f" bg="rgba(22,97,79,0.1)" icon={CheckCircle2} />
        <StatCard label="Completed" value={completed} sub={`${pctDone}% of all tasks`} color="#6366f1" bg="rgba(99,102,241,0.1)" icon={CheckCircle2} ring />
        <StatCard label="In Progress" value={inProgress} sub={`${total ? Math.round(inProgress / total * 100) : 0}% of all tasks`} color="#f59e0b" bg="rgba(245,158,11,0.1)" icon={Clock} ring />
        <StatCard label="Pending" value={pending} sub={`${total ? Math.round(pending / total * 100) : 0}% of all tasks`} color="#ef4444" bg="rgba(239,68,68,0.1)" icon={AlertCircle} ring />
        <StatCard label="Overdue" value={overdue} sub="Take action now!" color="#ef4444" bg="rgba(239,68,68,0.08)" icon={Bell} />
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="tb-main-grid">

        {/* ── Left: task list ── */}
        <div className="tb-left">
          <div className="tb-panel">
            <p className="tb-section-title">My Tasks</p>

            {/* tabs */}
            <div className="tb-tabs">
              {(["All", "Today", "Upcoming", "Overdue"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`tb-tab ${tab === t ? "tb-tab-active" : ""}`}>
                  {t}
                  {t === "Overdue" && overdue > 0 && <span className="tb-tab-badge">{overdue}</span>}
                </button>
              ))}
            </div>

            {/* search + filters */}
            <div className="tb-filter-row">
              <div className="tb-search-wrap">
                <Search size={14} className="tb-search-icon" />
                <input className="tb-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." />
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowCatDD(v => !v); setShowPrioDD(false); }} className="tb-filter-btn">
                  {catFilter} <ChevronDown size={13} />
                </button>
                {showCatDD && (
                  <div className="tb-dropdown">
                    {["All Categories", "Coding", "Study", "College", "Gym", "Personal", "Other"].map(c => (
                      <button key={c} onClick={() => { setCatFilter(c); setShowCatDD(false); }} className={`tb-dd-item ${catFilter === c ? "tb-dd-active" : ""}`}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => { setShowPrioDD(v => !v); setShowCatDD(false); }} className="tb-filter-btn">
                  {prioFilter} <ChevronDown size={13} />
                </button>
                {showPrioDD && (
                  <div className="tb-dropdown">
                    {["All Priorities", "High", "Medium", "Low"].map(p => (
                      <button key={p} onClick={() => { setPrioFilter(p); setShowPrioDD(false); }} className={`tb-dd-item ${prioFilter === p ? "tb-dd-active" : ""}`}>{p}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* task groups */}
            {filtered.length === 0 ? (
              <div className="tb-empty">
                <CheckCircle2 size={36} style={{ color: "var(--muted-foreground)", marginBottom: 8 }} />
                <p style={{ fontWeight: 700 }}>No tasks found</p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Try adjusting filters or add a new task.</p>
                <button onClick={() => setShowAdd(true)} className="tb-btn-primary" style={{ marginTop: 12 }}><Plus size={14} /> Add New Task</button>
              </div>
            ) : (
              <>
                {todayTasks.length > 0 && (
                  <div className="tb-group">
                    <p className="tb-group-label">Today · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    {todayTasks.map(t => <TaskRow key={t.id} task={t} onStatus={onStatus} onDelete={onDelete} />)}
                  </div>
                )}
                {tomorrowTasks.length > 0 && (
                  <div className="tb-group">
                    <p className="tb-group-label">Tomorrow · {new Date(Date.now() + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    {tomorrowTasks.map(t => <TaskRow key={t.id} task={t} onStatus={onStatus} onDelete={onDelete} />)}
                  </div>
                )}
                {otherTasks.length > 0 && (
                  <div className="tb-group">
                    <p className="tb-group-label">Upcoming</p>
                    {otherTasks.map(t => <TaskRow key={t.id} task={t} onStatus={onStatus} onDelete={onDelete} />)}
                  </div>
                )}
              </>
            )}

            <button onClick={() => setShowAdd(true)} className="tb-add-row">
              <Plus size={15} /> Add New Task
            </button>
          </div>
        </div>

        {/* ── Right: charts & panels ── */}
        <div className="tb-right">

          {/* Task Overview donut */}
          <div className="tb-panel">
            <p className="tb-section-title">Task Overview</p>
            <div className="tb-donut-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="tb-donut-center">
                <span className="tb-donut-num">{total}</span>
                <span className="tb-donut-lbl">Total</span>
              </div>
            </div>
            <div className="tb-legend">
              {[{ l: "Completed", v: completed, c: "#22c55e" }, { l: "In Progress", v: inProgress, c: "#6366f1" }, { l: "Pending", v: pending, c: "#f59e0b" }, { l: "Overdue", v: overdue, c: "#ef4444" }].map(d => (
                <div key={d.l} className="tb-legend-item">
                  <span className="tb-legend-dot" style={{ background: d.c }} />
                  <span className="tb-legend-label">{d.l}</span>
                  <span className="tb-legend-val">{d.v} ({total ? Math.round(d.v / total * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity Trend */}
          <div className="tb-panel">
            <div className="tb-panel-hd">
              <p className="tb-section-title">Productivity Trend</p>
              <span className="tb-badge-pill">This Week</span>
            </div>
            <TrendChart tasks={tasks} />
          </div>

          {/* Upcoming Deadlines */}
          <div className="tb-panel">
            <div className="tb-panel-hd">
              <p className="tb-section-title">Upcoming Deadlines</p>
              <button className="tb-link">View All</button>
            </div>
            {upcoming.length === 0 ? <p className="tb-empty-sm">No upcoming tasks</p> : upcoming.map(t => {
              const d = new Date(t.deadline);
              const daysLeft = Math.ceil((d.getTime() - nowMs) / 86400000);
              return (
                <div key={t.id} className="tb-deadline-row">
                  <div className="tb-deadline-icon" style={{ background: `${PRIORITY_COLOR2[t.priority]}18`, color: PRIORITY_COLOR2[t.priority] }}>
                    <AlertCircle size={14} />
                  </div>
                  <div className="tb-deadline-body">
                    <p className="tb-deadline-title">{t.title}</p>
                    <p className="tb-deadline-sub" style={{ color: PRIORITY_COLOR2[t.priority] }}>{t.priority} Priority</p>
                  </div>
                  <span className="tb-deadline-date" style={{ color: daysLeft <= 1 ? "#ef4444" : daysLeft <= 3 ? "#f59e0b" : "var(--muted-foreground)" }}>
                    {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow, " + fmtDate(t.deadline) : fmtDate(t.deadline)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tasks by Category */}
          <div className="tb-panel">
            <div className="tb-panel-hd">
              <p className="tb-section-title">Tasks by Category</p>
              <button className="tb-link">View All</button>
            </div>
            {catBreakdown.slice(0, 5).map(([cat, count]) => (
              <div key={cat} className="tb-cat-row">
                <span className="tb-cat-label">{cat}</span>
                <div className="tb-cat-bar-wrap">
                  <div className="tb-cat-bar" style={{ width: `${Math.round(count / total * 100)}%`, background: CAT_COLOR2[cat] ?? '#aeb7a7' }} />
                </div>
                <span className="tb-cat-count">{count}/{total}</span>
              </div>
            ))}
          </div>

          {/* Recent Completed */}
          {recent.length > 0 && (
            <div className="tb-panel">
              <p className="tb-section-title">Recent Completed Tasks</p>
              {recent.map(t => (
                <div key={t.id} className="tb-recent-row">
                  <CheckCircle2 size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <div className="tb-recent-body">
                    <p className="tb-recent-title">{t.title}</p>
                    <div className="tb-task-tags">
                      <span className="tb-tag" style={{ background: `${CAT_COLOR2[t.category] ?? '#aeb7a7'}15`, color: CAT_COLOR2[t.category] ?? '#aeb7a7' }}>{t.category}</span>
                    </div>
                  </div>
                  <span className="tb-recent-time">{fmtDate(t.deadline)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="tb-panel">
            <p className="tb-section-title">Quick Actions</p>
            <div className="tb-qa-grid">
              {[
                { l: "Add Task", c: "#22c55e", fn: () => setShowAdd(true) },
                { l: "Add Subtask", c: "#6366f1", fn: () => setShowAdd(true) },
                { l: "Add Note", c: "#f59e0b", fn: () => { } },
                { l: "Add Reminder", c: "#ef4444", fn: () => { } },
              ].map(a => (
                <button key={a.l} onClick={a.fn} className="tb-qa-btn" style={{ background: `${a.c}10`, color: a.c, border: `1px solid ${a.c}25` }}>
                  <Plus size={13} /> {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tb-top { display:flex; align-items:center; justify-content:flex-end; margin-bottom:12px; }
        .tb-top-actions { display:flex; align-items:center; gap:10px; }
        .tb-btn-primary { display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 18px; border-radius:12px; background:var(--primary); color:var(--primary-foreground); font-size:0.85rem; font-weight:700; border:none; cursor:pointer; transition:opacity .15s,transform .15s; }
        .tb-btn-primary:hover { opacity:.9; transform:translateY(-1px); }
        .tb-btn-ghost { display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 16px; border-radius:10px; background:var(--muted); color:var(--foreground); font-size:0.82rem; font-weight:600; border:none; cursor:pointer; }
        .tb-icon-btn { display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px; background:transparent; border:none; cursor:pointer; color:var(--muted-foreground); transition:background .15s; }
        .tb-icon-btn:hover { background:var(--muted); }
        .tb-icon-outline { border:1px solid var(--border) !important; }

        .tb-stats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:16px; }
        @media(max-width:1100px){ .tb-stats-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:640px){ .tb-stats-grid { grid-template-columns:repeat(2,1fr); } }

        .tb-stat { display:flex; align-items:center; gap:12px; padding:16px; border-radius:18px; background:var(--card); border:1px solid var(--border); }
        .tb-stat-icon { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; flex-shrink:0; }
        .tb-stat-info { flex:1; min-width:0; }
        .tb-stat-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted-foreground); }
        .tb-stat-value { font-size:1.6rem; font-weight:900; color:var(--foreground); line-height:1.1; }
        .tb-stat-sub { font-size:0.7rem; color:var(--muted-foreground); margin-top:1px; }

        .tb-main-grid { display:grid; grid-template-columns:1fr 380px; gap:16px; align-items:start; }
        @media(max-width:1100px){ .tb-main-grid { grid-template-columns:1fr; } }

        .tb-panel { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:18px; margin-bottom:14px; }
        .tb-panel:last-child { margin-bottom:0; }
        .tb-section-title { font-size:0.95rem; font-weight:900; color:var(--foreground); margin-bottom:12px; }
        .tb-panel-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .tb-panel-hd .tb-section-title { margin-bottom:0; }
        .tb-link { font-size:0.75rem; font-weight:700; color:var(--primary); background:none; border:none; cursor:pointer; }
        .tb-badge-pill { font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:20px; background:var(--muted); color:var(--muted-foreground); }

        .tb-tabs { display:flex; gap:4px; margin-bottom:14px; border-bottom:1px solid var(--border); padding-bottom:0; }
        .tb-tab { padding:6px 14px; border-radius:8px 8px 0 0; background:transparent; border:none; cursor:pointer; font-size:0.82rem; font-weight:600; color:var(--muted-foreground); transition:color .15s; position:relative; }
        .tb-tab-active { color:var(--primary); border-bottom:2px solid var(--primary); }
        .tb-tab-badge { display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:#ef4444; color:#fff; font-size:0.65rem; font-weight:800; margin-left:4px; }

        .tb-filter-row { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
        .tb-search-wrap { flex:1; min-width:140px; position:relative; }
        .tb-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--muted-foreground); pointer-events:none; }
        .tb-search { width:100%; height:36px; border-radius:10px; border:1px solid var(--border); background:var(--muted); padding:0 10px 0 32px; font-size:0.82rem; color:var(--foreground); outline:none; }
        .tb-filter-btn { display:flex; align-items:center; gap:5px; height:36px; padding:0 12px; border-radius:10px; border:1px solid var(--border); background:var(--muted); color:var(--foreground); font-size:0.8rem; font-weight:600; cursor:pointer; white-space:nowrap; }

        .tb-group { margin-bottom:12px; }
        .tb-group-label { font-size:0.75rem; font-weight:800; color:var(--muted-foreground); margin-bottom:6px; padding:0 2px; }

        .tb-task-row { display:flex; align-items:center; gap:10px; padding:10px 6px; border-bottom:1px solid var(--border); transition:background .15s; }
        .tb-task-row:last-child { border-bottom:none; }
        .tb-task-row:hover { background:color-mix(in srgb,var(--muted) 40%,transparent); border-radius:10px; }
        .tb-done { opacity:0.65; }
        .tb-circle-btn { background:none; border:none; cursor:pointer; padding:0; line-height:0; transition:transform .15s; }
        .tb-circle-btn:hover { transform:scale(1.15); }
        .tb-task-body { flex:1; min-width:0; }
        .tb-task-title { font-size:0.88rem; font-weight:700; color:var(--foreground); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tb-task-tags { display:flex; gap:5px; margin-top:3px; flex-wrap:wrap; }
        .tb-tag { font-size:0.68rem; font-weight:700; padding:2px 7px; border-radius:6px; }
        .tb-task-time { font-size:0.75rem; color:var(--muted-foreground); white-space:nowrap; flex-shrink:0; }

        .tb-dropdown { position:absolute; right:0; top:calc(100% + 4px); z-index:50; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:4px; min-width:140px; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
        .tb-dd-item { display:flex; align-items:center; gap:6px; width:100%; padding:8px 10px; border-radius:8px; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; color:var(--foreground); text-align:left; transition:background .1s; }
        .tb-dd-item:hover { background:var(--muted); }
        .tb-dd-danger { color:#ef4444; }
        .tb-dd-active { background:var(--muted); color:var(--primary); }

        .tb-empty { display:flex; flex-direction:column; align-items:center; padding:32px 16px; text-align:center; }
        .tb-empty-sm { font-size:0.8rem; color:var(--muted-foreground); padding:8px 0; }
        .tb-add-row { display:flex; align-items:center; gap:6px; margin-top:10px; padding:8px; width:100%; background:none; border:1px dashed var(--border); border-radius:10px; color:var(--muted-foreground); font-size:0.82rem; font-weight:600; cursor:pointer; transition:border-color .15s,color .15s; }
        .tb-add-row:hover { border-color:var(--primary); color:var(--primary); }

        .tb-donut-wrap { position:relative; }
        .tb-donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
        .tb-donut-num { font-size:2rem; font-weight:900; color:var(--foreground); line-height:1; }
        .tb-donut-lbl { font-size:0.72rem; font-weight:600; color:var(--muted-foreground); margin-top:2px; }
        .tb-legend { margin-top:12px; display:flex; flex-direction:column; gap:6px; }
        .tb-legend-item { display:flex; align-items:center; gap:8px; font-size:0.8rem; }
        .tb-legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .tb-legend-label { flex:1; color:var(--foreground); font-weight:600; }
        .tb-legend-val { color:var(--muted-foreground); font-weight:700; }

        .tb-deadline-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
        .tb-deadline-row:last-child { border-bottom:none; }
        .tb-deadline-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .tb-deadline-body { flex:1; min-width:0; }
        .tb-deadline-title { font-size:0.82rem; font-weight:700; color:var(--foreground); }
        .tb-deadline-sub { font-size:0.7rem; font-weight:600; margin-top:1px; }
        .tb-deadline-date { font-size:0.75rem; font-weight:700; flex-shrink:0; white-space:nowrap; }

        .tb-cat-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .tb-cat-label { font-size:0.78rem; font-weight:700; color:var(--foreground); width:64px; flex-shrink:0; }
        .tb-cat-bar-wrap { flex:1; height:7px; border-radius:99px; background:var(--muted); overflow:hidden; }
        .tb-cat-bar { height:100%; border-radius:99px; transition:width .5s; }
        .tb-cat-count { font-size:0.72rem; font-weight:700; color:var(--muted-foreground); width:36px; text-align:right; }

        .tb-recent-row { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border); }
        .tb-recent-row:last-child { border-bottom:none; }
        .tb-recent-body { flex:1; min-width:0; }
        .tb-recent-title { font-size:0.82rem; font-weight:700; color:var(--foreground); }
        .tb-recent-time { font-size:0.72rem; color:var(--muted-foreground); flex-shrink:0; }

        .tb-qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .tb-qa-btn { display:flex; align-items:center; gap:6px; padding:10px 12px; border-radius:10px; font-size:0.78rem; font-weight:700; cursor:pointer; transition:opacity .15s; }
        .tb-qa-btn:hover { opacity:.8; }

        /* Modal */
        .tb-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); }
        .tb-modal { background:var(--card); border:1px solid var(--border); border-radius:24px; width:100%; max-width:480px; margin:16px; box-shadow:0 24px 64px rgba(0,0,0,0.25); animation:tbSlide .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes tbSlide { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .tb-modal-hd { display:flex; align-items:flex-start; justify-content:space-between; padding:22px 22px 0; }
        .tb-modal-title { font-size:1.1rem; font-weight:900; color:var(--foreground); }
        .tb-modal-sub { font-size:0.78rem; color:var(--muted-foreground); margin-top:2px; }
        .tb-modal-body { padding:18px 22px 22px; display:flex; flex-direction:column; gap:13px; }
        .tb-modal-ft { display:flex; gap:10px; justify-content:flex-end; margin-top:4px; }
        .tb-field { display:flex; flex-direction:column; gap:5px; }
        .tb-label { font-size:0.75rem; font-weight:700; color:var(--muted-foreground); text-transform:uppercase; letter-spacing:.05em; }
        .tb-input { height:40px; border-radius:10px; border:1.5px solid var(--border); background:var(--muted); padding:0 12px; font-size:0.85rem; color:var(--foreground); outline:none; transition:border-color .15s; }
        .tb-input:focus { border-color:var(--primary); }
        .tb-ta { height:auto; padding:10px 12px; resize:none; }
        .tb-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .tb-field .tb-input[type=date], .tb-field .tb-input[type=time] { color:var(--foreground); }
        select.tb-input { appearance:none; cursor:pointer; }
      `}</style>
    </>
  );
}
