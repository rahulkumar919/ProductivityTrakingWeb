"use client";

import {
  Activity, CheckCircle2, ChevronDown, Flame, MoreVertical,
  Plus, Star, Target, TrendingUp, X, Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Goal, GoalPeriod } from "@/types";

/* ─── storage ──────────────────────────────────────────────────── */
const STORAGE_KEY = "devtrack_goals";
const ACTIVITY_KEY = "devtrack_activities";

type GoalExt = Goal & { category?: string; description?: string; status?: string; };

function load(): GoalExt[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(g: GoalExt[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)); } catch { /* ignore */ }
}
function appendActivity(type: string, desc: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const ex = raw ? JSON.parse(raw) : [];
    ex.unshift({ id: crypto.randomUUID(), type, description: desc, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(ex.slice(0, 200)));
  } catch { /* */ }
}

/* ─── constants ────────────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  Coding: "#6366f1", Reading: "#f59e0b", Project: "#14b8a6",
  Learning: "#8b5cf6", Health: "#ef4444", Mindset: "#ec4899", Other: "#aeb7a7",
};
const CATEGORIES = ["Coding", "Reading", "Project", "Learning", "Health", "Mindset", "Other"];

function statusColor(p: number) {
  if (p >= 100) return "#22c55e";
  if (p > 0) return "#6366f1";
  return "#aeb7a7";
}
function statusLabel(p: number) {
  if (p >= 100) return "Completed";
  if (p > 0) return "In Progress";
  return "Not Started";
}

/* ─── Add Goal Modal ───────────────────────────────────────────── */
function AddGoalModal({ onAdd, onClose }: { onAdd: (g: GoalExt) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Coding");
  const [period, setPeriod] = useState<GoalPeriod>("Monthly");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onAdd({
      id: crypto.randomUUID(), title: title.trim(), description: desc.trim(),
      category: cat, period, deadline, progress,
      status: progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started",
    });
    onClose();
  }

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-modal" onClick={e => e.stopPropagation()}>
        <div className="gm-modal-hd">
          <div><h2 className="gm-modal-title">Create New Goal</h2><p className="gm-modal-sub">Set goals, stay focused, achieve more.</p></div>
          <button onClick={onClose} className="gm-icon-btn"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="gm-modal-body">
          <div className="gm-field"><label className="gm-label">Goal Title *</label>
            <input className="gm-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Solve 200 DSA Problems" required autoFocus /></div>
          <div className="gm-field"><label className="gm-label">Description</label>
            <input className="gm-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Improve problem solving skills" /></div>
          <div className="gm-row2">
            <div className="gm-field"><label className="gm-label">Category</label>
              <select className="gm-input gm-sel" value={cat} onChange={e => setCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="gm-field"><label className="gm-label">Period</label>
              <select className="gm-input gm-sel" value={period} onChange={e => setPeriod(e.target.value as GoalPeriod)}>
                <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option>
              </select></div>
          </div>
          <div className="gm-row2">
            <div className="gm-field"><label className="gm-label">Deadline *</label>
              <input className="gm-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required /></div>
            <div className="gm-field"><label className="gm-label">Initial Progress (%)</label>
              <input className="gm-input" type="number" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} /></div>
          </div>
          <div className="gm-modal-ft">
            <button type="button" onClick={onClose} className="gm-btn-ghost">Cancel</button>
            <button type="submit" className="gm-btn-primary"><Plus size={15} /> Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Goal Row ─────────────────────────────────────────────────── */
function GoalRow({ goal, onProgress, onDelete }: {
  goal: GoalExt; onProgress: (id: string, p: number) => void; onDelete: (id: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const color = CAT_COLORS[goal.category ?? "Other"] ?? "#aeb7a7";
  const sc = statusColor(goal.progress);
  const sl = statusLabel(goal.progress);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="gm-goal-row">
      <div className="gm-goal-icon-wrap" style={{ background: `${color}15`, color }}><Target size={16} /></div>
      <div className="gm-goal-info">
        <p className="gm-goal-title">{goal.title}</p>
        {goal.description && <p className="gm-goal-desc">{goal.description}</p>}
      </div>
      <span className="gm-cat-badge" style={{ background: `${color}15`, color }}>{goal.category ?? "Other"}</span>
      <span className="gm-period">{goal.period}</span>
      <div className="gm-progress-cell">
        <div className="gm-progress-bar-wrap">
          <div className="gm-progress-bar" style={{ width: `${goal.progress}%`, background: `linear-gradient(90deg,${color}cc,${color})` }} />
        </div>
        <input type="range" min={0} max={100} value={goal.progress}
          onChange={e => onProgress(goal.id, Number(e.target.value))}
          className="gm-range" aria-label="Update progress" />
        <span className="gm-pct" style={{ color }}>{goal.progress}%</span>
      </div>
      <span className="gm-status-badge" style={{ background: `${sc}12`, color: sc }}>{sl}</span>
      <span className="gm-deadline">{goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setMenu(v => !v)} className="gm-icon-btn" aria-label="options"><MoreVertical size={15} /></button>
        {menu && (
          <div className="gm-dropdown">
            <button onClick={() => { onProgress(goal.id, 100); setMenu(false); }} className="gm-dd-item">Mark Complete</button>
            <button onClick={() => { onProgress(goal.id, 0); setMenu(false); }} className="gm-dd-item">Reset Progress</button>
            <button onClick={() => { onDelete(goal.id); setMenu(false); }} className="gm-dd-item gm-dd-danger"><X size={12} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Goal Progress Chart ──────────────────────────────────────── */
function GoalProgressChart({ goals }: { goals: GoalExt[] }) {
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const data = ["1 Aug", "8 Aug", "15 Aug", "22 Aug", "29 Aug"].map((d, i) => ({
    date: d, progress: Math.min(100, Math.round(avgProgress * (i + 1) / 5))
  }));
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
        <Line type="monotone" dataKey="progress" stroke="var(--primary)" strokeWidth={2.5}
          dot={{ fill: "var(--primary)", r: 3 }} activeDot={{ r: 5 }} name="Progress %" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Main Export ──────────────────────────────────────────────── */
export function GoalManager() {
  const [goals, setGoals] = useState<GoalExt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"All Goals" | "Daily" | "Weekly" | "Monthly" | "Yearly">("All Goals");
  useEffect(() => { setGoals(load()); setHydrated(true); }, []);

  const update = useCallback((fn: (p: GoalExt[]) => GoalExt[]) => {
    setGoals(prev => { const next = fn(prev); save(next); return next; });
  }, []);

  function addGoal(g: GoalExt) {
    update(prev => [g, ...prev]);
    appendActivity("Goal Created", `Created: ${g.title}`);
  }
  function onProgress(id: string, p: number) {
    update(prev => prev.map(g => g.id === id ? { ...g, progress: p, status: p >= 100 ? "Completed" : p > 0 ? "In Progress" : "Not Started" } : g));
    if (p >= 100) { const g = goals.find(x => x.id === id); if (g) appendActivity("Goal Completed", `Completed: ${g.title}`); }
  }
  function onDelete(id: string) {
    const g = goals.find(x => x.id === id);
    update(prev => prev.filter(x => x.id !== id));
    if (g) appendActivity("Goal Deleted", `Deleted: ${g.title}`);
  }

  const filtered = useMemo(() => goals.filter(g =>
    tab === "All Goals" ? true : g.period === tab
  ), [goals, tab]);

  const completed = goals.filter(g => g.progress >= 100).length;
  const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;
  const notStarted = goals.filter(g => g.progress === 0).length;
  const successRate = goals.length ? Math.round((completed / goals.length) * 100) : 0;

  const pieData = [
    { name: "Coding", value: goals.filter(g => g.category === "Coding").length, color: "#6366f1" },
    { name: "Learning", value: goals.filter(g => g.category === "Learning" || g.category === "Reading").length, color: "#8b5cf6" },
    { name: "Project", value: goals.filter(g => g.category === "Project").length, color: "#14b8a6" },
    { name: "Health", value: goals.filter(g => g.category === "Health").length, color: "#ef4444" },
    { name: "Mindset", value: goals.filter(g => g.category === "Mindset").length, color: "#ec4899" },
  ].filter(d => d.value > 0);

  const upcoming = goals.filter(g => g.progress < 100 && g.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);

  const recent = goals.filter(g => g.progress > 0)
    .sort((a, b) => b.progress - a.progress).slice(0, 4);

  const MOTIVATIONS = [
    "Discipline today leads to freedom tomorrow.",
    "Every step forward counts. Keep going!",
    "Goals without deadlines are just dreams.",
  ];
  const quote = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  if (!hydrated) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />)}</div>;

  return (
    <>
      {showAdd && <AddGoalModal onAdd={addGoal} onClose={() => setShowAdd(false)} />}

      {/* top bar */}
      <div className="gm-top">
        <div />
        <div className="gm-top-actions">
          <button onClick={() => setShowAdd(true)} className="gm-btn-primary"><Plus size={15} /> Create Goal</button>
          <button className="gm-btn-outline"><Star size={14} /> Templates</button>
          <button className="gm-icon-btn gm-icon-border"><TrendingUp size={16} /></button>
          <button className="gm-icon-btn gm-icon-border" style={{ position: "relative" }}>
            <Activity size={16} />
            {goals.filter(g => g.deadline && new Date(g.deadline) < new Date() && g.progress < 100).length > 0 && (
              <span className="gm-notif-dot" />
            )}
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="gm-stats-grid">
        {[
          { l: "Total Goals", v: goals.length, sub: "↑ 16% vs last month", c: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: Target },
          { l: "Completed", v: completed, sub: `${successRate}% of total goals`, c: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: CheckCircle2 },
          { l: "In Progress", v: inProgress, sub: `${goals.length ? Math.round(inProgress / goals.length * 100) : 0}% of total goals`, c: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Activity },
          { l: "Not Started", v: notStarted, sub: `${goals.length ? Math.round(notStarted / goals.length * 100) : 0}% of total goals`, c: "#aeb7a7", bg: "rgba(174,183,167,0.1)", icon: Zap },
          { l: "Success Rate", v: `${successRate}%`, sub: "↑ 12% vs last month", c: "#14b8a6", bg: "rgba(20,184,166,0.1)", icon: TrendingUp },
        ].map(s => (
          <div key={s.l} className="gm-stat">
            <div className="gm-stat-icon" style={{ background: s.bg, color: s.c }}><s.icon size={20} /></div>
            <div><p className="gm-stat-label">{s.l}</p><p className="gm-stat-value">{s.v}</p><p className="gm-stat-sub">{s.sub}</p></div>
          </div>
        ))}
      </div>

      {/* main grid */}
      <div className="gm-main-grid">

        {/* LEFT: goal table */}
        <div>
          <div className="gm-panel">
            {/* tabs */}
            <div className="gm-tabs">
              {(["All Goals", "Daily", "Weekly", "Monthly", "Yearly"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`gm-tab ${tab === t ? "gm-tab-active" : ""}`}>{t}</button>
              ))}
            </div>
            {/* table header */}
            <div className="gm-table-hd">
              <span>Goal</span><span>Category</span><span>Period</span>
              <span>Progress</span><span>Status</span><span>Deadline</span><span />
            </div>
            {/* rows */}
            {filtered.length === 0 ? (
              <div className="gm-empty">
                <Target size={36} style={{ color: "var(--muted-foreground)", marginBottom: 8 }} />
                <p style={{ fontWeight: 700 }}>No goals yet</p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Create your first goal to start tracking.</p>
                <button onClick={() => setShowAdd(true)} className="gm-btn-primary" style={{ marginTop: 12 }}><Plus size={14} /> Add New Goal</button>
              </div>
            ) : filtered.map(g => (
              <GoalRow key={g.id} goal={g} onProgress={onProgress} onDelete={onDelete} />
            ))}
            <button onClick={() => setShowAdd(true)} className="gm-add-row"><Plus size={14} /> Add New Goal</button>
          </div>

          {/* bottom: progress chart + donut + recent */}
          <div className="gm-bottom-grid">
            <div className="gm-panel">
              <p className="gm-section-title">Goal Progress <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 600 }}>(This Month)</span></p>
              <GoalProgressChart goals={goals} />
            </div>
            <div className="gm-panel">
              <p className="gm-section-title">Goals by Category</p>
              {pieData.length === 0 ? <p className="gm-empty-sm">No data yet.</p> : (
                <div className="gm-cat-donut-wrap">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="gm-donut-center"><span className="gm-donut-num">{goals.length}</span><span className="gm-donut-lbl">Total Goals</span></div>
                  <div className="gm-cat-legend">
                    {pieData.map(d => (
                      <div key={d.name} className="gm-cat-leg-item">
                        <span className="gm-cat-dot" style={{ background: d.color }} />
                        <span>{d.name}</span><span className="gm-cat-pct">{goals.length ? Math.round(d.value / goals.length * 100) : 0}% ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="gm-panel">
              <div className="gm-panel-hd"><p className="gm-section-title">Recent Activity</p><button className="gm-link">View All</button></div>
              {recent.length === 0 ? <p className="gm-empty-sm">No activity yet.</p> : recent.map(g => (
                <div key={g.id} className="gm-activity-row">
                  <Activity size={14} style={{ color: CAT_COLORS[g.category ?? "Other"] ?? "#aeb7a7", flexShrink: 0 }} />
                  <div className="gm-activity-body">
                    <p className="gm-activity-title">{g.title}</p>
                    <p className="gm-activity-sub">{g.progress}% complete · {g.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div>
          {/* Goal Calendar placeholder */}
          <div className="gm-panel">
            <div className="gm-panel-hd"><p className="gm-section-title">Goal Calendar</p><span className="gm-badge-outline">This Month</span></div>
            <div className="gm-cal-grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d} className="gm-cal-hd">{d}</div>)}
              {goals.slice(0, 7).map((_, i) => (
                Array.from({ length: 7 }).map((_, di) => (
                  <div key={`${i}${di}`} className="gm-cal-cell">
                    <span className="gm-cal-dot" style={{
                      background: (i + di) % 3 === 0 ? "#ef4444" : (i + di) % 2 === 0 ? "var(--primary)" : "var(--muted)",
                      opacity: (i + di) % 4 === 0 ? 0.3 : 1,
                    }} />
                  </div>
                ))
              ))}
            </div>
            <div className="gm-cal-legend"><span className="gm-cal-leg-lbl">Less</span>
              {["0.2", "0.5", "0.8", "1"].map(o => <span key={o} className="gm-cal-leg-dot" style={{ background: `rgba(22,97,79,${o})` }} />)}
              <span className="gm-cal-leg-lbl">More</span>
            </div>
          </div>

          {/* Milestones */}
          <div className="gm-panel" style={{ marginTop: 12 }}>
            <div className="gm-panel-hd">
              <p className="gm-section-title">Milestones</p>
              <span className="gm-badge-green">{successRate}%</span>
            </div>
            {[{ l: "Research & Planning", d: "Project roadmap & requirements", done: true }, { l: "Core Development", d: "Build the main features", done: inProgress > 0 }, { l: "Testing & Debugging", d: "Test all features", done: false }, { l: "Deployment", d: "Deploy and make it live", done: false }].map((m, i) => (
              <div key={i} className="gm-milestone-row">
                <div className={`gm-milestone-check ${m.done ? "gm-ms-done" : ""}`}>{m.done && <CheckCircle2 size={14} />}</div>
                <div><p className="gm-ms-label">{m.l}</p><p className="gm-ms-desc">{m.d}</p></div>
              </div>
            ))}
          </div>

          {/* Upcoming Deadlines */}
          <div className="gm-panel" style={{ marginTop: 12 }}>
            <div className="gm-panel-hd"><p className="gm-section-title">Upcoming Deadlines</p><button className="gm-link">View All</button></div>
            {upcoming.length === 0 ? <p className="gm-empty-sm">No upcoming deadlines.</p> : upcoming.map(g => (
              <div key={g.id} className="gm-deadline-row">
                <div className="gm-dl-icon" style={{ background: `${CAT_COLORS[g.category ?? "Other"] ?? '#aeb7a7'}15`, color: CAT_COLORS[g.category ?? "Other"] ?? "#aeb7a7" }}><Target size={13} /></div>
                <div className="gm-dl-body"><p className="gm-dl-title">{g.title}</p></div>
                <span className="gm-dl-date">{g.deadline ? new Date(g.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="gm-panel gm-quote-panel" style={{ marginTop: 12 }}>
            <span className="gm-quote-mark">&ldquo;</span>
            <p className="gm-quote-text">{quote}</p>
            <p className="gm-quote-author">— Unknown</p>
          </div>

          {/* Quick Actions */}
          <div className="gm-panel" style={{ marginTop: 12 }}>
            <p className="gm-section-title">Quick Actions</p>
            <div className="gm-qa-grid">
              {[{ l: "Create Goal", c: "#22c55e", fn: () => setShowAdd(true) }, { l: "Templates", c: "#6366f1", fn: () => { } }, { l: "Goal Analytics", c: "#f59e0b", fn: () => { } }, { l: "Export Goals", c: "#f97316", fn: () => { } }].map(a => (
                <button key={a.l} onClick={a.fn} className="gm-qa-btn" style={{ background: `${a.c}10`, color: a.c, border: `1px solid ${a.c}25` }}>
                  <Plus size={12} /> {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gm-top{display:flex;justify-content:flex-end;margin-bottom:12px;}
        .gm-top-actions{display:flex;gap:10px;align-items:center;}
        .gm-btn-primary{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 18px;border-radius:12px;background:var(--primary);color:var(--primary-foreground);font-size:.85rem;font-weight:700;border:none;cursor:pointer;transition:opacity .15s;}
        .gm-btn-primary:hover{opacity:.88;}
        .gm-btn-outline{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 16px;border-radius:12px;background:transparent;color:var(--foreground);font-size:.82rem;font-weight:600;border:1px solid var(--border);cursor:pointer;}
        .gm-btn-outline:hover{background:var(--muted);}
        .gm-btn-ghost{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 16px;border-radius:10px;background:var(--muted);color:var(--foreground);font-size:.82rem;font-weight:600;border:none;cursor:pointer;}
        .gm-icon-btn{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:transparent;border:none;cursor:pointer;color:var(--muted-foreground);position:relative;}
        .gm-icon-btn:hover{background:var(--muted);}
        .gm-icon-border{border:1px solid var(--border)!important;}
        .gm-notif-dot{position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:#ef4444;border:2px solid var(--card);}

        .gm-stats-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px;}
        @media(max-width:1100px){.gm-stats-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:640px){.gm-stats-grid{grid-template-columns:repeat(2,1fr);}}
        .gm-stat{display:flex;align-items:center;gap:12px;padding:16px;border-radius:18px;background:var(--card);border:1px solid var(--border);}
        .gm-stat-icon{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;flex-shrink:0;}
        .gm-stat-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);}
        .gm-stat-value{font-size:1.5rem;font-weight:900;color:var(--foreground);line-height:1.1;}
        .gm-stat-sub{font-size:.68rem;color:var(--muted-foreground);}

        .gm-main-grid{display:grid;grid-template-columns:1fr 300px;gap:14px;align-items:start;}
        @media(max-width:1100px){.gm-main-grid{grid-template-columns:1fr;}}

        .gm-panel{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:18px;}
        .gm-section-title{font-size:.9rem;font-weight:900;color:var(--foreground);margin-bottom:12px;}
        .gm-panel-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .gm-panel-hd .gm-section-title{margin-bottom:0;}
        .gm-link{font-size:.75rem;font-weight:700;color:var(--primary);background:none;border:none;cursor:pointer;}
        .gm-badge-outline{font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--muted);color:var(--muted-foreground);}
        .gm-badge-green{font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:20px;background:rgba(22,97,79,0.12);color:var(--primary);}

        .gm-tabs{display:flex;gap:4px;margin-bottom:12px;border-bottom:1px solid var(--border);}
        .gm-tab{padding:6px 14px;border-radius:8px 8px 0 0;background:transparent;border:none;cursor:pointer;font-size:.8rem;font-weight:600;color:var(--muted-foreground);}
        .gm-tab-active{color:var(--primary);border-bottom:2px solid var(--primary);}

        .gm-table-hd{display:grid;grid-template-columns:1fr 90px 80px 160px 110px 110px 36px;gap:8px;padding:6px 10px;background:var(--muted);border-radius:10px;margin-bottom:4px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);}

        .gm-goal-row{display:grid;grid-template-columns:1fr 90px 80px 160px 110px 110px 36px;gap:8px;align-items:center;padding:10px;border-bottom:1px solid var(--border);}
        .gm-goal-row:last-of-type{border-bottom:none;}
        .gm-goal-row:hover{background:color-mix(in srgb,var(--muted) 40%,transparent);border-radius:10px;}
        .gm-goal-icon-wrap{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .gm-goal-info{display:flex;align-items:center;gap:10px;min-width:0;}
        .gm-goal-title{font-size:.85rem;font-weight:700;color:var(--foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .gm-goal-desc{font-size:.7rem;color:var(--muted-foreground);}
        .gm-cat-badge{font-size:.7rem;font-weight:700;padding:3px 8px;border-radius:6px;width:fit-content;}
        .gm-period{font-size:.78rem;color:var(--muted-foreground);font-weight:600;}
        .gm-progress-cell{display:flex;align-items:center;gap:6px;}
        .gm-progress-bar-wrap{flex:1;height:6px;border-radius:99px;background:var(--muted);overflow:hidden;}
        .gm-progress-bar{height:100%;border-radius:99px;transition:width .5s;}
        .gm-range{position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;}
        .gm-pct{font-size:.75rem;font-weight:800;flex-shrink:0;min-width:28px;text-align:right;}
        .gm-status-badge{font-size:.7rem;font-weight:700;padding:3px 8px;border-radius:6px;width:fit-content;white-space:nowrap;}
        .gm-deadline{font-size:.75rem;color:var(--muted-foreground);font-weight:600;white-space:nowrap;}

        .gm-dropdown{position:absolute;right:0;top:calc(100%+4px);z-index:50;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:4px;min-width:140px;box-shadow:0 8px 24px rgba(0,0,0,.12);}
        .gm-dd-item{display:flex;align-items:center;gap:6px;width:100%;padding:8px 10px;border-radius:8px;background:none;border:none;cursor:pointer;font-size:.8rem;font-weight:600;color:var(--foreground);text-align:left;}
        .gm-dd-item:hover{background:var(--muted);}
        .gm-dd-danger{color:#ef4444;}

        .gm-empty{display:flex;flex-direction:column;align-items:center;padding:32px 16px;text-align:center;}
        .gm-empty-sm{font-size:.8rem;color:var(--muted-foreground);padding:8px 0;}
        .gm-add-row{display:flex;align-items:center;gap:6px;margin-top:10px;padding:8px;width:100%;background:none;border:1px dashed var(--border);border-radius:10px;color:var(--muted-foreground);font-size:.82rem;font-weight:600;cursor:pointer;}
        .gm-add-row:hover{border-color:var(--primary);color:var(--primary);}

        .gm-bottom-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:14px;}
        @media(max-width:900px){.gm-bottom-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:600px){.gm-bottom-grid{grid-template-columns:1fr;}}

        .gm-cat-donut-wrap{position:relative;}
        .gm-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}
        .gm-donut-num{font-size:1.5rem;font-weight:900;color:var(--foreground);}
        .gm-donut-lbl{font-size:.68rem;color:var(--muted-foreground);}
        .gm-cat-legend{display:flex;flex-direction:column;gap:4px;margin-top:6px;}
        .gm-cat-leg-item{display:flex;align-items:center;gap:6px;font-size:.75rem;color:var(--foreground);}
        .gm-cat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .gm-cat-pct{margin-left:auto;color:var(--muted-foreground);font-size:.7rem;}

        .gm-activity-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border);}
        .gm-activity-row:last-child{border-bottom:none;}
        .gm-activity-body{flex:1;min-width:0;}
        .gm-activity-title{font-size:.82rem;font-weight:700;color:var(--foreground);}
        .gm-activity-sub{font-size:.7rem;color:var(--muted-foreground);}

        .gm-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;}
        .gm-cal-hd{font-size:.65rem;font-weight:700;text-align:center;color:var(--muted-foreground);}
        .gm-cal-cell{display:flex;align-items:center;justify-content:center;}
        .gm-cal-dot{width:10px;height:10px;border-radius:2px;}
        .gm-cal-legend{display:flex;align-items:center;gap:4px;justify-content:flex-end;}
        .gm-cal-leg-lbl{font-size:.65rem;color:var(--muted-foreground);}
        .gm-cal-leg-dot{width:9px;height:9px;border-radius:2px;}

        .gm-milestone-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);}
        .gm-milestone-row:last-child{border-bottom:none;}
        .gm-milestone-check{width:24px;height:24px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:transparent;}
        .gm-ms-done{background:var(--primary);border-color:var(--primary);color:var(--primary-foreground)!important;}
        .gm-ms-label{font-size:.82rem;font-weight:700;color:var(--foreground);}
        .gm-ms-desc{font-size:.7rem;color:var(--muted-foreground);}

        .gm-deadline-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);}
        .gm-deadline-row:last-child{border-bottom:none;}
        .gm-dl-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .gm-dl-body{flex:1;min-width:0;}
        .gm-dl-title{font-size:.82rem;font-weight:700;color:var(--foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .gm-dl-date{font-size:.72rem;font-weight:700;color:var(--muted-foreground);flex-shrink:0;white-space:nowrap;}

        .gm-quote-panel{background:linear-gradient(135deg,rgba(22,97,79,.08),rgba(94,196,168,.05));border-color:rgba(22,97,79,.2);}
        .gm-quote-mark{font-size:2rem;line-height:1;color:var(--primary);opacity:.5;font-family:Georgia,serif;}
        .gm-quote-text{font-size:.88rem;font-weight:700;color:var(--foreground);font-style:italic;margin:4px 0;}
        .gm-quote-author{font-size:.75rem;color:var(--muted-foreground);}

        .gm-qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;}
        .gm-qa-btn{display:flex;align-items:center;gap:6px;padding:10px 12px;border-radius:10px;font-size:.78rem;font-weight:700;cursor:pointer;}

        /* modal */
        .gm-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);}
        .gm-modal{background:var(--card);border:1px solid var(--border);border-radius:24px;width:100%;max-width:480px;margin:16px;box-shadow:0 24px 64px rgba(0,0,0,.25);animation:gmSlide .3s cubic-bezier(.34,1.56,.64,1);}
        @keyframes gmSlide{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        .gm-modal-hd{display:flex;align-items:flex-start;justify-content:space-between;padding:22px 22px 0;}
        .gm-modal-title{font-size:1.1rem;font-weight:900;color:var(--foreground);}
        .gm-modal-sub{font-size:.78rem;color:var(--muted-foreground);margin-top:2px;}
        .gm-modal-body{padding:18px 22px 22px;display:flex;flex-direction:column;gap:13px;}
        .gm-modal-ft{display:flex;gap:10px;justify-content:flex-end;margin-top:4px;}
        .gm-field{display:flex;flex-direction:column;gap:5px;}
        .gm-label{font-size:.72rem;font-weight:700;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:.05em;}
        .gm-input{height:40px;border-radius:10px;border:1.5px solid var(--border);background:var(--muted);padding:0 12px;font-size:.85rem;color:var(--foreground);outline:none;}
        .gm-input:focus{border-color:var(--primary);}
        .gm-sel{appearance:none;cursor:pointer;}
        .gm-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
      `}</style>
    </>
  );
}
