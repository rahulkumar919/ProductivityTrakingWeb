"use client";

import {
  Activity, ArrowRight, BookMarked, CheckCircle2,
  Clock, Code2, ExternalLink, Flame, ListTodo,
  Plus, Sparkles, Target, Timer, TrendingUp, Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DSA_CATEGORIES } from "@/data/dsa-questions";
import type { Goal, Habit, Task, TimeSession } from "@/types";

/* ─── helpers ──────────────────────────────────────────────────── */
function load<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadObj<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function fmt(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function dayName() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

/* ─── Donut chart ──────────────────────────────────────────────── */
function TaskDonut({ completed, inProgress, todo }: { completed: number; inProgress: number; todo: number }) {
  const total = completed + inProgress + todo || 1;
  const data = [
    { name: "Completed", value: completed, color: "#22c55e" },
    { name: "In Progress", value: inProgress, color: "#6366f1" },
    { name: "Pending", value: todo, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  return (
    <div className="relative flex items-center justify-center" style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={54} outerRadius={78}
            paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [`${Number(v)} (${Math.round((Number(v) / total) * 100)}%)`, String(n)]}
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {/* center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-black" style={{ color: "var(--foreground)" }}>{completed + inProgress + todo}</span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>Total Tasks</span>
      </div>
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg, sub }: {
  label: string; value: string | number;
  icon: React.ElementType; color: string; bg: string; sub?: string;
}) {
  return (
    <div className="db-stat-card" style={{ "--sc-color": color, "--sc-bg": bg } as React.CSSProperties}>
      <div className="db-stat-icon"><Icon size={18} /></div>
      <div className="db-stat-body">
        <p className="db-stat-label">{label}</p>
        <p className="db-stat-value">{value}</p>
        {sub && <p className="db-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Quick Action Button ──────────────────────────────────────── */
function QuickAction({ label, icon: Icon, href, color }: {
  label: string; icon: React.ElementType; href: string; color: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] hover:opacity-90"
      style={{ background: `${color}14`, color, border: `1.5px solid ${color}25` }}>
      <Icon size={15} />
      {label}
    </Link>
  );
}

/* ─── DSA Progress mini rows ───────────────────────────────────── */
function DSAProgressPanel({ dsaProgress }: { dsaProgress: Record<string, string> }) {
  const totalSolved = Object.values(dsaProgress).filter(v => v === "solved").length;
  const totalQ = DSA_CATEGORIES.reduce((s, c) => s + c.questions.length, 0);
  const pct = Math.round((totalSolved / totalQ) * 100);

  const topCats = DSA_CATEGORIES.slice(0, 6).map(cat => {
    const solved = cat.questions.filter(q => dsaProgress[q.id] === "solved").length;
    return { name: cat.name, emoji: cat.emoji, color: cat.color, solved, total: cat.questions.length };
  });

  return (
    <div className="db-panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="db-panel-title">DSA Progress</h3>
        <Link href="/dsa" className="db-link">View All <ArrowRight size={12} /></Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black" style={{ color: "var(--primary)" }}>{pct}%</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{totalSolved} / {totalQ} solved</p>
        </div>
        <div className="flex size-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(22,97,79,0.1)" }}>
          <Code2 size={28} style={{ color: "var(--primary)" }} />
        </div>
      </div>

      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,var(--primary),#5ec4a8)" }} />
      </div>

      <div className="space-y-2">
        {topCats.map(c => {
          const cp = Math.round((c.solved / c.total) * 100);
          return (
            <div key={c.name} className="flex items-center gap-2.5">
              <span className="text-sm w-5 text-center">{c.emoji}</span>
              <span className="text-xs flex-1 font-medium truncate" style={{ color: "var(--foreground)" }}>{c.name}</span>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${cp}%`, background: c.color }} />
              </div>
              <span className="text-xs font-black w-10 text-right" style={{ color: c.color }}>{c.solved}/{c.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Pending tasks list ───────────────────────────────────────── */
function PendingTasksPanel({ tasks, nowMs }: { tasks: Task[]; nowMs: number }) {
  const pending = tasks.filter(t => t.status !== "Completed")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  return (
    <div className="db-panel space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="db-panel-title">Upcoming Deadlines</h3>
        <Link href="/tasks" className="db-link">View All <ArrowRight size={12} /></Link>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 size={28} style={{ color: "var(--primary)" }} />
          <p className="text-sm font-bold">All caught up! 🎉</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No pending tasks.</p>
        </div>
      ) : pending.map(task => {
        const daysLeft = Math.ceil((new Date(task.deadline).getTime() - nowMs) / 86400000);
        const overdue = daysLeft < 0;
        const urgent = daysLeft <= 1 && !overdue;
        return (
          <div key={task.id} className="flex items-center gap-3 rounded-2xl p-3 border transition-all hover:border-primary/30"
            style={{
              background: overdue ? "rgba(239,68,68,0.04)" : urgent ? "rgba(245,158,11,0.04)" : "var(--muted)",
              borderColor: overdue ? "rgba(239,68,68,0.2)" : urgent ? "rgba(245,158,11,0.2)" : "var(--border)",
            }}>
            <div className="size-2.5 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[task.priority] }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{task.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{task.category}</p>
            </div>
            <span className="text-xs font-black shrink-0 rounded-lg px-2 py-1"
              style={{
                background: overdue ? "rgba(239,68,68,0.12)" : urgent ? "rgba(245,158,11,0.12)" : "var(--card)",
                color: overdue ? "#ef4444" : urgent ? "#f59e0b" : "var(--muted-foreground)",
              }}>
              {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Recent Sessions ──────────────────────────────────────────── */
function RecentSessionsPanel({ sessions }: { sessions: TimeSession[] }) {
  const recent = sessions.slice(0, 4);
  const MODE_COLOR: Record<string, string> = {
    "Coding Session": "#6366f1", "Study Session": "#f59e0b",
    "Deep Work": "#14b8a6", "Pomodoro": "#ef4444",
  };

  return (
    <div className="db-panel space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="db-panel-title">Recent Sessions</h3>
        <Link href="/timer" className="db-link">Start <ArrowRight size={12} /></Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Timer size={28} style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-bold">No sessions yet</p>
          <Link href="/timer" className="text-xs font-bold" style={{ color: "var(--primary)" }}>Start a focus session →</Link>
        </div>
      ) : recent.map((s, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--muted)" }}>
          <div className="flex size-9 items-center justify-center rounded-xl shrink-0"
            style={{ background: `${MODE_COLOR[s.mode] ?? "#6366f1"}18` }}>
            <Timer size={16} style={{ color: MODE_COLOR[s.mode] ?? "#6366f1" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{s.mode}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.taskTitle || "Unlinked"}</p>
          </div>
          <span className="text-sm font-black shrink-0" style={{ color: MODE_COLOR[s.mode] ?? "#6366f1" }}>
            {fmt(s.durationMinutes)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Goals Panel ──────────────────────────────────────────────── */
function GoalsPanel({ goals }: { goals: Goal[] }) {
  const active = goals.slice(0, 4);
  return (
    <div className="db-panel space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="db-panel-title">Active Goals</h3>
        <Link href="/goals" className="db-link">View All <ArrowRight size={12} /></Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Target size={28} style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm font-bold">No goals yet</p>
          <Link href="/goals" className="text-xs font-bold" style={{ color: "var(--primary)" }}>Add a goal →</Link>
        </div>
      ) : active.map(g => (
        <div key={g.id} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{g.title}</p>
            <span className="text-xs font-black ml-2 shrink-0" style={{ color: g.progress >= 100 ? "#22c55e" : "var(--primary)" }}>
              {g.progress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${g.progress}%`, background: g.progress >= 100 ? "#22c55e" : "linear-gradient(90deg,var(--primary),#5ec4a8)" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{g.period} · Due {g.deadline}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Email reminder modal ─────────────────────────────────────── */
function ReminderModal({ pendingCount, onClose }: { pendingCount: number; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!email.trim()) { setError("Please enter your email."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pendingCount }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("Could not send email. Check your mail settings.");
    } finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="rounded-3xl p-8 max-w-sm w-full mx-4 space-y-5"
        style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "dbFade .3s ease" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex size-14 items-center justify-center rounded-2xl mx-auto"
          style={{ background: "rgba(239,68,68,0.1)" }}>
          <span className="text-3xl">📬</span>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-black">Send Reminder Email</h3>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            You have <strong>{pendingCount}</strong> pending task{pendingCount !== 1 ? "s" : ""}. Send yourself a reminder.
          </p>
        </div>
        {!sent ? (
          <>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              onKeyDown={e => e.key === "Enter" && send()} />
            {error && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-bold"
                style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
              <button onClick={send} disabled={sending}
                className="flex-1 rounded-2xl py-3 text-sm font-black"
                style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff" }}>
                {sending ? "Sending…" : "Send Now"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-4xl">✅</p>
            <p className="font-black">Reminder sent!</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Check your inbox at <strong>{email}</strong></p>
            <button onClick={onClose} className="w-full rounded-2xl py-3 text-sm font-bold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard Export ────────────────────────────────────── */
export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dsaProgress, setDsaProgress] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("there");
  const [hydrated, setHydrated] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  // Stable "now" captured once on mount — avoids impure Date.now() in render
  const [nowMs] = useState(() => Date.now());
  useEffect(() => {
    setTasks(load("devtrack_tasks"));
    setHabits(load("devtrack_habits"));
    setSessions(load("devtrack_sessions"));
    setGoals(load("devtrack_goals"));
    setDsaProgress(loadObj<Record<string, string>>("devtrack_dsa_progress") ?? {});
    // Try to get name from profile API
    fetch("/api/profile").then(r => r.json()).then(d => { if (d?.name) setUserName(d.name.split(" ")[0]); }).catch(() => { });
    setHydrated(true);
  }, []);

  const completed = useMemo(() => tasks.filter(t => t.status === "Completed").length, [tasks]);
  const inProgress = useMemo(() => tasks.filter(t => t.status === "In Progress").length, [tasks]);
  const todo = useMemo(() => tasks.filter(t => t.status === "Todo").length, [tasks]);
  const pending = inProgress + todo;

  const focusMinutes = useMemo(() => sessions.reduce((s, x) => s + (x.durationMinutes ?? 0), 0), [sessions]);
  const dsaSolved = useMemo(() => Object.values(dsaProgress).filter(v => v === "solved").length, [dsaProgress]);
  const bestStreak = useMemo(() => habits.reduce((m, h) => Math.max(m, h.streak ?? 0), 0), [habits]);
  const habitsCompletedToday = useMemo(() => habits.filter(h => h.completedToday).length, [habits]);

  // Pending tasks check — show banner if any overdue
  const overdueTasks = useMemo(() => tasks.filter(t => {
    if (t.status === "Completed") return false;
    return new Date(t.deadline).getTime() < nowMs;
  }), [tasks, nowMs]);

  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: ListTodo, color: "#6366f1", bg: "rgba(99,102,241,0.1)", sub: `${completed} completed` },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.1)", sub: `${Math.round((completed / (tasks.length || 1)) * 100)}% done` },
    { label: "Focus Time", value: fmt(focusMinutes), icon: Timer, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", sub: `${sessions.length} sessions` },
    { label: "DSA Solved", value: dsaSolved, icon: Code2, color: "#14b8a6", bg: "rgba(20,184,166,0.1)", sub: `${Math.round((dsaSolved / 106) * 100)}% of 106` },
    { label: "Current Streak", value: bestStreak > 0 ? `${bestStreak} days` : "—", icon: Flame, color: "#ef4444", bg: "rgba(239,68,68,0.1)", sub: bestStreak > 0 ? "Keep it up! 🔥" : "Start today" },
    { label: "Habits Today", value: `${habitsCompletedToday}/${habits.length}`, icon: Activity, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", sub: habits.length > 0 ? `${Math.round((habitsCompletedToday / habits.length) * 100)}% complete` : "No habits set" },
  ];

  const MOTIVATIONS = [
    "Discipline today leads to freedom tomorrow.",
    "Small consistent steps beat big bursts.",
    "Every problem solved is a skill earned.",
    "The grind is the goal.",
    "Code. Study. Repeat.",
    "One more problem. One step closer.",
  ];
  const motivation = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  if (!hydrated) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-28 rounded-3xl" style={{ background: "var(--muted)" }} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl" style={{ background: "var(--muted)" }} />)}
      </div>
    </div>
  );

  return (
    <>
      {showReminder && <ReminderModal pendingCount={pending} onClose={() => setShowReminder(false)} />}

      <div className="space-y-5">

        {/* ── Hero welcome banner ── */}
        <div className="db-hero">
          <div className="flex-1 min-w-0">
            <p className="db-hero-greeting">{greeting()}, {userName} 👋</p>
            <p className="db-hero-date">{dayName()}</p>
            <p className="db-hero-sub">Here&apos;s what&apos;s happening with your productivity today.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {overdueTasks.length > 0 && (
              <button onClick={() => setShowReminder(true)}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all hover:opacity-90 animate-pulse"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1.5px solid rgba(239,68,68,0.3)" }}>
                📬 {overdueTasks.length} Overdue — Send Reminder
              </button>
            )}
            {pending > 0 && overdueTasks.length === 0 && (
              <button onClick={() => setShowReminder(true)}
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1.5px solid rgba(245,158,11,0.2)" }}>
                📬 {pending} Pending — Remind Me
              </button>
            )}
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
              style={{ background: "rgba(22,97,79,0.1)", border: "1.5px solid rgba(22,97,79,0.2)" }}>
              <Sparkles size={15} style={{ color: "var(--primary)" }} />
              <span className="text-xs font-bold italic max-w-48 truncate" style={{ color: "var(--primary)" }}>
                &ldquo;{motivation}&rdquo;
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Main 3-col layout ── */}
        <div className="grid gap-5 xl:grid-cols-3">

          {/* Col 1 — Task donut + pending */}
          <div className="space-y-5">
            <div className="db-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="db-panel-title">Task Overview</h3>
                <Link href="/tasks" className="db-link">View All <ArrowRight size={12} /></Link>
              </div>
              <TaskDonut completed={completed} inProgress={inProgress} todo={todo} />
              {/* legend */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Completed", value: completed, color: "#22c55e" },
                  { label: "In Progress", value: inProgress, color: "#6366f1" },
                  { label: "Pending", value: todo, color: "#f59e0b" },
                ].map(d => (
                  <div key={d.label} className="rounded-xl p-2 text-center" style={{ background: `${d.color}10` }}>
                    <p className="text-lg font-black" style={{ color: d.color }}>{d.value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <GoalsPanel goals={goals} />
          </div>

          {/* Col 2 — Pending tasks + sessions */}
          <div className="space-y-5">
            <PendingTasksPanel tasks={tasks} nowMs={nowMs} />
            <RecentSessionsPanel sessions={sessions} />
          </div>

          {/* Col 3 — DSA progress + quick actions */}
          <div className="space-y-5">
            <DSAProgressPanel dsaProgress={dsaProgress} />

            {/* Quick Actions */}
            <div className="db-panel space-y-3">
              <h3 className="db-panel-title">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <QuickAction label="Focus Session" icon={Timer} href="/timer" color="#6366f1" />
                <QuickAction label="DSA Problem" icon={Code2} href="/dsa" color="#14b8a6" />
                <QuickAction label="Add Task" icon={Plus} href="/tasks" color="#22c55e" />
                <QuickAction label="Study Vault" icon={BookMarked} href="/study-vault" color="#f59e0b" />
                <QuickAction label="Track Habit" icon={Activity} href="/habits" color="#8b5cf6" />
                <QuickAction label="Set Goal" icon={Target} href="/goals" color="#ef4444" />
              </div>
            </div>

            {/* Productivity tip */}
            <div className="db-panel"
              style={{ background: "linear-gradient(135deg,rgba(22,97,79,0.12),rgba(94,196,168,0.08))", borderColor: "rgba(22,97,79,0.2)" }}>
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl shrink-0"
                  style={{ background: "rgba(22,97,79,0.12)" }}>
                  <Zap size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--primary)" }}>Daily Tip</p>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {dsaSolved < 10
                      ? "Solve at least 2 DSA problems daily to build a strong foundation."
                      : pending > 3
                        ? "You have several pending tasks. Focus on the highest priority ones first."
                        : habitsCompletedToday < habits.length
                          ? "Don't break the streak — check off your remaining habits today!"
                          : "You're on track! Keep up the consistency. 💪"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Habit streaks strip ── */}
        {habits.length > 0 && (
          <div className="db-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="db-panel-title">Habit Streaks</h3>
              <Link href="/habits" className="db-link">Manage <ArrowRight size={12} /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {habits.slice(0, 4).map(h => (
                <div key={h.id} className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: h.completedToday ? "rgba(22,97,79,0.08)" : "var(--muted)", border: `1.5px solid ${h.completedToday ? "rgba(22,97,79,0.2)" : "var(--border)"}` }}>
                  <div className="flex size-9 items-center justify-center rounded-xl shrink-0"
                    style={{ background: h.completedToday ? "rgba(22,97,79,0.12)" : "var(--card)" }}>
                    <Flame size={16} style={{ color: h.completedToday ? "var(--primary)" : "var(--muted-foreground)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{h.title}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{h.streak} day streak</p>
                  </div>
                  {h.completedToday && (
                    <CheckCircle2 size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Productivity trend placeholder ── */}
        {sessions.length > 0 && (
          <div className="db-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="db-panel-title">Productivity Trend</h3>
              <Link href="/analytics" className="db-link flex items-center gap-1">
                <TrendingUp size={12} /> Full Analytics <ExternalLink size={11} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Total Focus", value: fmt(focusMinutes), color: "#6366f1", icon: Timer },
                { label: "Sessions", value: sessions.length, color: "#14b8a6", icon: Activity },
                { label: "Avg Session", value: fmt(Math.round(focusMinutes / (sessions.length || 1))), color: "#f59e0b", icon: Clock },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 text-center"
                  style={{ background: `${s.color}0d`, border: `1.5px solid ${s.color}20` }}>
                  <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* Hero */
        .db-hero {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          padding: 24px 28px; border-radius: 28px;
          background: linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--primary) 6%, var(--card)) 100%);
          border: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .db-hero-greeting { font-size: 1.5rem; font-weight: 900; color: var(--foreground); }
        .db-hero-date { font-size: 0.8rem; font-weight: 600; color: var(--muted-foreground); margin-top: 2px; }
        .db-hero-sub { font-size: 0.8rem; color: var(--muted-foreground); margin-top: 4px; }

        /* Stat card */
        .db-stat-card {
          display: flex; align-items: center; gap: 14px;
          padding: 18px; border-radius: 20px;
          background: var(--card); border: 1px solid var(--border);
          transition: box-shadow .2s, transform .2s;
        }
        .db-stat-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .db-stat-icon {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: var(--sc-bg); color: var(--sc-color);
        }
        .db-stat-body { flex: 1; min-width: 0; }
        .db-stat-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted-foreground); }
        .db-stat-value { font-size: 1.55rem; font-weight: 900; color: var(--foreground); line-height: 1.2; margin-top: 2px; }
        .db-stat-sub { font-size: 0.7rem; color: var(--muted-foreground); margin-top: 2px; }

        /* Panel */
        .db-panel {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 24px; padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .db-panel-title { font-size: 0.9rem; font-weight: 900; color: var(--foreground); }
        .db-link {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 700; color: var(--primary);
          text-decoration: none; transition: opacity .15s;
        }
        .db-link:hover { opacity: .7; }

        @keyframes dbFade {
          from { opacity: 0; transform: scale(.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
