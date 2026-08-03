"use client";

import {
  Activity, BarChart2, Check, ChevronDown, Flame,
  MoreVertical, Plus, Star, Trash2, X, Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Habit } from "@/types";

/* ─── storage ──────────────────────────────────────────────────── */
const STORAGE_KEY = "devtrack_habits";
const ACTIVITY_KEY = "devtrack_activities";

function load(): Habit[] {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(h: Habit[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); } catch { /* ignore */ }
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
  Learning: "#f97316", Health: "#ef4444", Mindset: "#8b5cf6",
  Other: "#aeb7a7",
};
const CATEGORIES = ["Coding", "Reading", "Project", "Learning", "Health", "Mindset", "Other"];

type HabitExt = Habit & { category?: string; description?: string; frequency?: string; };

/* ─── Add Habit Modal ──────────────────────────────────────────── */
function AddHabitModal({ onAdd, onClose }: { onAdd: (h: HabitExt) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Coding");
  const [freq, setFreq] = useState("Daily");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(), title: title.trim(), description: desc.trim(),
      category: cat, frequency: freq, streak: 0, longestStreak: 0,
      completedToday: false, monthlyHistory: [],
    });
    onClose();
  }

  return (
    <div className="ht-overlay" onClick={onClose}>
      <div className="ht-modal" onClick={e => e.stopPropagation()}>
        <div className="ht-modal-hd">
          <div><h2 className="ht-modal-title">Add New Habit</h2><p className="ht-modal-sub">Build small habits, get consistent.</p></div>
          <button onClick={onClose} className="ht-icon-btn"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="ht-modal-body">
          <div className="ht-field"><label className="ht-label">Habit Title *</label>
            <input className="ht-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. LeetCode Practice" required autoFocus /></div>
          <div className="ht-field"><label className="ht-label">Description</label>
            <input className="ht-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Solve at least 1 problem daily" /></div>
          <div className="ht-row2">
            <div className="ht-field"><label className="ht-label">Category</label>
              <select className="ht-input ht-sel" value={cat} onChange={e => setCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div className="ht-field"><label className="ht-label">Frequency</label>
              <select className="ht-input ht-sel" value={freq} onChange={e => setFreq(e.target.value)}>
                <option>Daily</option><option>Weekly</option><option>Weekdays</option>
              </select></div>
          </div>
          <div className="ht-modal-ft">
            <button type="button" onClick={onClose} className="ht-btn-ghost">Cancel</button>
            <button type="submit" className="ht-btn-primary"><Plus size={15} /> Add Habit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Habit Calendar (7x5 grid) ────────────────────────────────── */
function HabitCalendar({ habits }: { habits: HabitExt[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rows = 5;
  return (
    <div className="ht-cal-wrap">
      <div className="ht-cal-grid" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
        {/* header */}
        <div />
        {days.map(d => <div key={d} className="ht-cal-hd">{d}</div>)}
        {/* habit rows */}
        {habits.slice(0, 8).map((h, hi) => (
          <>
            <div key={`l${hi}`} className="ht-cal-habit-label">
              <div className="ht-cal-icon" style={{ background: `${CAT_COLORS[h.category ?? 'Other']}18`, color: CAT_COLORS[h.category ?? 'Other'] }}>
                <Activity size={10} />
              </div>
            </div>
            {Array.from({ length: 7 }).map((_, di) => {
              const done = h.monthlyHistory[h.monthlyHistory.length - (7 - di)] ?? (di < (h.streak % 7));
              return (
                <div key={`d${hi}${di}`} className="ht-cal-cell">
                  <span className="ht-cal-dot" style={{
                    background: done ? CAT_COLORS[h.category ?? 'Other'] : "var(--muted)",
                    opacity: done ? 1 : 0.4,
                  }} />
                </div>
              );
            })}
          </>
        ))}
      </div>
      <div className="ht-cal-legend">
        <span className="ht-cal-leg-label">Less</span>
        {["0.2", "0.4", "0.7", "1"].map(o => (
          <span key={o} className="ht-cal-leg-dot" style={{ background: `rgba(22,97,79,${o})` }} />
        ))}
        <span className="ht-cal-leg-label">More</span>
      </div>
    </div>
  );
}

/* ─── Streak Line Chart ────────────────────────────────────────── */
function StreakChart({ habits }: { habits: HabitExt[] }) {
  const totalStreak = habits.reduce((s, h) => s + (h.streak || 0), 0);
  const data = ["28 Jul", "29 Jul", "30 Jul", "31 Jul", "1 Aug", "2 Aug", "3 Aug"].map((d, i) => ({
    date: d, streak: Math.max(1, Math.round(totalStreak * (i + 1) / 7)),
  }));
  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
        <Line type="monotone" dataKey="streak" stroke="var(--primary)" strokeWidth={2.5}
          dot={{ fill: "var(--primary)", r: 3 }} activeDot={{ r: 5 }} name="Streak" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Completion Donut ─────────────────────────────────────────── */
function CompletionDonut({ habits }: { habits: HabitExt[] }) {
  const done = habits.filter(h => h.completedToday).length;
  const total = habits.length || 1;
  const pct = Math.round((done / total) * 100);
  const data = [
    { name: "Completed", value: done, color: "var(--primary)" },
    { name: "Missed", value: total - done, color: "#ef4444" },
  ].filter(d => d.value > 0);
  return (
    <div className="ht-donut-wrap">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="ht-donut-center">
        <span className="ht-donut-pct">{pct}%</span>
        <span className="ht-donut-lbl">Overall</span>
      </div>
      <div className="ht-donut-legend">
        <div className="ht-dl-item"><span className="ht-dl-dot" style={{ background: "var(--primary)" }} /><span>Completed {done} ({pct}%)</span></div>
        <div className="ht-dl-item"><span className="ht-dl-dot" style={{ background: "#ef4444" }} /><span>Missed {total - done} ({100 - pct}%)</span></div>
      </div>
    </div>
  );
}

/* ─── Main Export ──────────────────────────────────────────────── */
export function HabitTracker() {
  const [habits, setHabits] = useState<HabitExt[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All Habits" | "Active" | "Completed" | "Paused">("All Habits");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [showCatDD, setShowCatDD] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHabits(load() as HabitExt[]); setHydrated(true); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDD(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const update = useCallback((fn: (prev: HabitExt[]) => HabitExt[]) => {
    setHabits(prev => { const next = fn(prev); save(next); return next; });
  }, []);

  function addHabit(h: HabitExt) {
    update(prev => [...prev, h]);
    appendActivity("Habit Created", `Created: ${h.title}`);
  }

  function check(id: string) {
    update(prev => prev.map(h => {
      if (h.id !== id || h.completedToday) return h;
      const streak = h.streak + 1;
      appendActivity("Habit Completed", `Completed: ${h.title} · streak ${streak}`);
      return { ...h, completedToday: true, streak, longestStreak: Math.max(h.longestStreak, streak), monthlyHistory: [...(h.monthlyHistory || []), true].slice(-30) };
    }));
  }

  function del(id: string) {
    update(prev => prev.filter(h => h.id !== id));
  }

  const filtered = useMemo(() => habits.filter(h => {
    const mq = !search || h.title.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "All Categories" || (h as HabitExt).category === catFilter;
    const mt = tab === "All Habits" ? true : tab === "Active" ? !h.completedToday : tab === "Completed" ? h.completedToday : true;
    return mq && mc && mt;
  }), [habits, search, catFilter, tab]);

  const completedToday = habits.filter(h => h.completedToday).length;
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const completionRate = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  const totalCheckins = habits.reduce((s, h) => s + (h.streak || 0), 0);

  if (!hydrated) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />)}</div>;

  return (
    <>
      {showAdd && <AddHabitModal onAdd={addHabit} onClose={() => setShowAdd(false)} />}

      {/* top action row */}
      <div className="ht-top">
        <div />
        <div className="ht-top-actions">
          <button onClick={() => setShowAdd(true)} className="ht-btn-primary"><Plus size={15} /> Add Habit</button>
          <button className="ht-btn-outline"><Star size={14} /> Templates</button>
          <button className="ht-icon-btn ht-icon-border"><BarChart2 size={16} /></button>
        </div>
      </div>

      {/* stat cards */}
      <div className="ht-stats-grid">
        {[
          { label: "Total Habits", value: habits.length, sub: "↑ 14% vs last week", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: Activity, ring: false },
          { label: "Completed Today", value: completedToday, sub: `${completionRate}% of today's habits`, color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: Check, ring: true, pct: completionRate },
          { label: "Best Streak", value: `${bestStreak} Days`, sub: "Current best streak", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Flame, ring: false },
          { label: "Completion Rate", value: `${completionRate}%`, sub: "↑ 9% vs last week", color: "#14b8a6", bg: "rgba(20,184,166,0.1)", icon: Zap, ring: true, pct: completionRate },
          { label: "Total Check-ins", value: totalCheckins, sub: "This week", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: BarChart2, ring: false },
        ].map(s => (
          <div key={s.label} className="ht-stat">
            <div className="ht-stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="ht-stat-info">
              <p className="ht-stat-label">{s.label}</p>
              <p className="ht-stat-value">{s.value}</p>
              <p className="ht-stat-sub">{s.sub}</p>
            </div>
            {s.ring && (
              <svg width={50} height={50} viewBox="0 0 50 50" style={{ flexShrink: 0 }}>
                <circle cx={25} cy={25} r={20} fill="none" stroke="var(--muted)" strokeWidth={4} />
                <circle cx={25} cy={25} r={20} fill="none" stroke={s.color} strokeWidth={4}
                  strokeDasharray={`${2 * Math.PI * 20 * (s.pct ?? 0) / 100} 999`}
                  strokeLinecap="round" transform="rotate(-90 25 25)" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* main grid */}
      <div className="ht-main-grid">
        {/* LEFT: habit table */}
        <div>
          <div className="ht-panel">
            {/* tabs */}
            <div className="ht-tabs-row">
              {(["All Habits", "Active", "Completed", "Paused"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`ht-tab ${tab === t ? "ht-tab-active" : ""}`}>{t}</button>
              ))}
              <div className="ht-tab-spacer" />
              <div className="ht-search-wrap">
                <input className="ht-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search habits..." />
              </div>
              <div ref={catRef} style={{ position: "relative" }}>
                <button onClick={() => setShowCatDD(v => !v)} className="ht-filter-btn">
                  {catFilter} <ChevronDown size={13} />
                </button>
                {showCatDD && (
                  <div className="ht-dropdown">
                    {["All Categories", ...CATEGORIES].map(c => (
                      <button key={c} onClick={() => { setCatFilter(c); setShowCatDD(false); }} className={`ht-dd-item ${catFilter === c ? "ht-dd-active" : ""}`}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* table header */}
            <div className="ht-table-hd">
              <span className="ht-th-habit">Habit</span>
              <span className="ht-th">Category</span>
              <span className="ht-th">Frequency</span>
              <span className="ht-th">Streak</span>
              <span className="ht-th">Today</span>
              <span className="ht-th-action" />
            </div>

            {/* rows */}
            {filtered.length === 0 ? (
              <div className="ht-empty"><Flame size={32} style={{ color: "var(--muted-foreground)", marginBottom: 8 }} /><p style={{ fontWeight: 700 }}>No habits found</p><p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Add a habit to start building consistency.</p><button onClick={() => setShowAdd(true)} className="ht-btn-primary" style={{ marginTop: 12 }}><Plus size={14} /> Add New Habit</button></div>
            ) : filtered.map(h => {
              const color = CAT_COLORS[(h as HabitExt).category ?? "Other"] ?? "#aeb7a7";
              return (
                <div key={h.id} className="ht-habit-row">
                  <div className="ht-habit-info">
                    <div className="ht-habit-icon" style={{ background: `${color}18`, color }}><Activity size={14} /></div>
                    <div>
                      <p className="ht-habit-name">{h.title}</p>
                      {(h as HabitExt).description && <p className="ht-habit-desc">{(h as HabitExt).description}</p>}
                    </div>
                  </div>
                  <span className="ht-cat-badge" style={{ background: `${color}15`, color }}>{(h as HabitExt).category ?? "Other"}</span>
                  <span className="ht-freq">{(h as HabitExt).frequency ?? "Daily"}</span>
                  <span className="ht-streak-cell">
                    <Flame size={13} style={{ color: "#f59e0b" }} />
                    <span className="ht-streak-num">{h.streak}</span>
                    <span className="ht-streak-lbl">days</span>
                  </span>
                  <div className="ht-today-cell">
                    <button onClick={() => check(h.id)}
                      className={`ht-check-btn ${h.completedToday ? "ht-checked" : ""}`}
                      aria-label="Mark habit">
                      {h.completedToday && <Check size={14} />}
                    </button>
                  </div>
                  <button onClick={() => del(h.id)} className="ht-del-btn" aria-label="Delete habit"><Trash2 size={14} /></button>
                </div>
              );
            })}

            <button onClick={() => setShowAdd(true)} className="ht-add-row"><Plus size={14} /> Add New Habit</button>
          </div>

          {/* bottom row: streak progress + donut + recent activity */}
          <div className="ht-bottom-grid">
            <div className="ht-panel">
              <div className="ht-panel-hd">
                <p className="ht-section-title">Streak Progress</p>
                <span className="ht-badge">{bestStreak} Day Streak</span>
              </div>
              <p className="ht-streak-sub">Your current streak</p>
              <StreakChart habits={habits} />
            </div>
            <div className="ht-panel">
              <div className="ht-panel-hd">
                <p className="ht-section-title">Habit Completion</p>
                <span className="ht-badge-outline">This Week</span>
              </div>
              <CompletionDonut habits={habits} />
            </div>
            <div className="ht-panel">
              <div className="ht-panel-hd"><p className="ht-section-title">Recent Activity</p><button className="ht-link">View All</button></div>
              {habits.filter(h => h.completedToday).slice(0, 4).length === 0
                ? <p className="ht-empty-sm">No activity yet today.</p>
                : habits.filter(h => h.completedToday).slice(0, 4).map(h => (
                  <div key={h.id} className="ht-activity-row">
                    <Check size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <div className="ht-activity-body">
                      <p className="ht-activity-title">{h.title}</p>
                      <p className="ht-activity-sub">Completed · Today, {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <button className="ht-icon-btn"><MoreVertical size={14} /></button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* RIGHT: calendar + insights */}
        <div>
          <div className="ht-panel">
            <div className="ht-panel-hd">
              <p className="ht-section-title">Habit Calendar</p>
              <span className="ht-badge-outline">This Month</span>
            </div>
            <HabitCalendar habits={habits} />
          </div>

          <div className="ht-panel" style={{ marginTop: 14 }}>
            <div className="ht-panel-hd">
              <p className="ht-section-title">Insights</p>
              <span className="ht-badge-outline">This Week</span>
            </div>
            <div className="ht-insight-row">
              <div className="ht-insight-col">
                <p className="ht-insight-lbl">Most Consistent</p>
                {habits.sort((a, b) => b.streak - a.streak).slice(0, 1).map(h => (
                  <div key={h.id} className="ht-insight-item">
                    <span className="ht-insight-name">{h.title}</span>
                    <div className="ht-insight-bar-wrap"><div className="ht-insight-bar" style={{ width: `${Math.min(h.streak * 10, 100)}%`, background: "var(--primary)" }} /></div>
                    <span className="ht-insight-pct">{Math.min(h.streak * 10, 100)}%</span>
                  </div>
                ))}
              </div>
              <div className="ht-insight-col">
                <p className="ht-insight-lbl">Needs Attention</p>
                {habits.filter(h => !h.completedToday).slice(0, 1).map(h => (
                  <div key={h.id} className="ht-insight-item">
                    <span className="ht-insight-name">{h.title}</span>
                    <div className="ht-insight-bar-wrap"><div className="ht-insight-bar" style={{ width: `${completionRate}%`, background: "#f59e0b" }} /></div>
                    <span className="ht-insight-pct">{completionRate}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ht-tip-box"><Zap size={14} style={{ color: "#f59e0b", flexShrink: 0 }} /><p className="ht-tip-text">Consistency is the key to success. You&apos;re doing great! Keep going!</p></div>
          </div>

          <div className="ht-panel" style={{ marginTop: 14 }}>
            <p className="ht-section-title">Quick Actions</p>
            <div className="ht-qa-grid">
              {[{ l: "Add Habit", c: "#22c55e", fn: () => setShowAdd(true) }, { l: "Templates", c: "#6366f1", fn: () => { } }, { l: "Habit Analytics", c: "#f59e0b", fn: () => { } }, { l: "Export Data", c: "#f97316", fn: () => { } }].map(a => (
                <button key={a.l} onClick={a.fn} className="ht-qa-btn" style={{ background: `${a.c}10`, color: a.c, border: `1px solid ${a.c}25` }}>
                  <Plus size={12} /> {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ht-top { display:flex; justify-content:flex-end; margin-bottom:12px; }
        .ht-top-actions { display:flex; gap:10px; align-items:center; }
        .ht-btn-primary { display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 18px; border-radius:12px; background:var(--primary); color:var(--primary-foreground); font-size:0.85rem; font-weight:700; border:none; cursor:pointer; transition:opacity .15s; }
        .ht-btn-primary:hover { opacity:.88; }
        .ht-btn-outline { display:inline-flex; align-items:center; gap:7px; height:40px; padding:0 16px; border-radius:12px; background:transparent; color:var(--foreground); font-size:0.82rem; font-weight:600; border:1px solid var(--border); cursor:pointer; transition:background .15s; }
        .ht-btn-outline:hover { background:var(--muted); }
        .ht-btn-ghost { display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 16px; border-radius:10px; background:var(--muted); color:var(--foreground); font-size:0.82rem; font-weight:600; border:none; cursor:pointer; }
        .ht-icon-btn { display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px; background:transparent; border:none; cursor:pointer; color:var(--muted-foreground); }
        .ht-icon-btn:hover { background:var(--muted); }
        .ht-icon-border { border:1px solid var(--border) !important; }

        .ht-stats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:16px; }
        @media(max-width:1100px){ .ht-stats-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:640px){ .ht-stats-grid{grid-template-columns:repeat(2,1fr);} }
        .ht-stat { display:flex; align-items:center; gap:12px; padding:16px; border-radius:18px; background:var(--card); border:1px solid var(--border); }
        .ht-stat-icon { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; flex-shrink:0; }
        .ht-stat-info { flex:1; min-width:0; }
        .ht-stat-label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted-foreground); }
        .ht-stat-value { font-size:1.5rem; font-weight:900; color:var(--foreground); line-height:1.1; }
        .ht-stat-sub { font-size:0.68rem; color:var(--muted-foreground); }

        .ht-main-grid { display:grid; grid-template-columns:1fr 300px; gap:14px; align-items:start; }
        @media(max-width:1100px){ .ht-main-grid{grid-template-columns:1fr;} }

        .ht-panel { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:18px; }
        .ht-section-title { font-size:0.9rem; font-weight:900; color:var(--foreground); }
        .ht-panel-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .ht-panel-hd .ht-section-title { margin-bottom:0; }
        .ht-link { font-size:0.75rem; font-weight:700; color:var(--primary); background:none; border:none; cursor:pointer; }
        .ht-badge { font-size:0.7rem; font-weight:800; padding:3px 10px; border-radius:20px; background:rgba(22,97,79,0.12); color:var(--primary); }
        .ht-badge-outline { font-size:0.7rem; font-weight:700; padding:3px 10px; border-radius:20px; background:var(--muted); color:var(--muted-foreground); }

        .ht-tabs-row { display:flex; align-items:center; gap:4px; margin-bottom:12px; flex-wrap:wrap; }
        .ht-tab { padding:6px 14px; border-radius:8px; background:transparent; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; color:var(--muted-foreground); }
        .ht-tab-active { background:var(--muted); color:var(--foreground); font-weight:700; }
        .ht-tab-spacer { flex:1; }
        .ht-search-wrap { position:relative; }
        .ht-search { height:34px; border-radius:10px; border:1px solid var(--border); background:var(--muted); padding:0 12px; font-size:0.8rem; color:var(--foreground); outline:none; width:140px; }
        .ht-filter-btn { display:flex; align-items:center; gap:5px; height:34px; padding:0 12px; border-radius:10px; border:1px solid var(--border); background:var(--muted); color:var(--foreground); font-size:0.78rem; font-weight:600; cursor:pointer; white-space:nowrap; }

        .ht-table-hd { display:grid; grid-template-columns:1fr 90px 90px 90px 60px 36px; gap:8px; padding:6px 10px; background:var(--muted); border-radius:10px; margin-bottom:4px; }
        .ht-th-habit,.ht-th,.ht-th-action { font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--muted-foreground); }

        .ht-habit-row { display:grid; grid-template-columns:1fr 90px 90px 90px 60px 36px; gap:8px; align-items:center; padding:10px 10px; border-bottom:1px solid var(--border); transition:background .15s; }
        .ht-habit-row:last-of-type { border-bottom:none; }
        .ht-habit-row:hover { background:color-mix(in srgb,var(--muted) 40%,transparent); border-radius:10px; }
        .ht-habit-info { display:flex; align-items:center; gap:10px; min-width:0; }
        .ht-habit-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ht-habit-name { font-size:0.85rem; font-weight:700; color:var(--foreground); }
        .ht-habit-desc { font-size:0.72rem; color:var(--muted-foreground); margin-top:1px; }
        .ht-cat-badge { font-size:0.7rem; font-weight:700; padding:3px 8px; border-radius:6px; width:fit-content; }
        .ht-freq { font-size:0.78rem; color:var(--muted-foreground); font-weight:600; }
        .ht-streak-cell { display:flex; align-items:center; gap:4px; }
        .ht-streak-num { font-size:0.9rem; font-weight:800; color:var(--foreground); }
        .ht-streak-lbl { font-size:0.7rem; color:var(--muted-foreground); }
        .ht-today-cell { display:flex; justify-content:center; }
        .ht-check-btn { width:28px; height:28px; border-radius:8px; border:2px solid var(--border); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; color:transparent; }
        .ht-checked { background:var(--primary); border-color:var(--primary); color:var(--primary-foreground) !important; }
        .ht-del-btn { display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:8px; background:none; border:none; cursor:pointer; color:var(--muted-foreground); }
        .ht-del-btn:hover { color:#ef4444; background:rgba(239,68,68,0.08); }
        .ht-empty { display:flex; flex-direction:column; align-items:center; padding:32px 16px; text-align:center; }
        .ht-empty-sm { font-size:0.8rem; color:var(--muted-foreground); padding:8px 0; }
        .ht-add-row { display:flex; align-items:center; gap:6px; margin-top:10px; padding:8px; width:100%; background:none; border:1px dashed var(--border); border-radius:10px; color:var(--muted-foreground); font-size:0.82rem; font-weight:600; cursor:pointer; }
        .ht-add-row:hover { border-color:var(--primary); color:var(--primary); }

        .ht-dropdown { position:absolute; right:0; top:calc(100%+4px); z-index:50; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:4px; min-width:140px; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
        .ht-dd-item { display:block; width:100%; padding:8px 10px; border-radius:8px; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; color:var(--foreground); text-align:left; }
        .ht-dd-item:hover { background:var(--muted); }
        .ht-dd-active { background:var(--muted); color:var(--primary); }

        .ht-bottom-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-top:14px; }
        @media(max-width:900px){ .ht-bottom-grid{grid-template-columns:1fr 1fr;} }
        @media(max-width:600px){ .ht-bottom-grid{grid-template-columns:1fr;} }
        .ht-streak-sub { font-size:0.75rem; color:var(--muted-foreground); margin:-8px 0 8px; }

        .ht-donut-wrap { position:relative; }
        .ht-donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
        .ht-donut-pct { font-size:1.6rem; font-weight:900; color:var(--foreground); }
        .ht-donut-lbl { font-size:0.7rem; color:var(--muted-foreground); }
        .ht-donut-legend { display:flex; flex-direction:column; gap:5px; margin-top:8px; }
        .ht-dl-item { display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--foreground); font-weight:600; }
        .ht-dl-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        .ht-activity-row { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border); }
        .ht-activity-row:last-child { border-bottom:none; }
        .ht-activity-body { flex:1; min-width:0; }
        .ht-activity-title { font-size:0.82rem; font-weight:700; color:var(--foreground); }
        .ht-activity-sub { font-size:0.7rem; color:var(--muted-foreground); margin-top:1px; }

        /* calendar */
        .ht-cal-wrap { overflow-x:auto; }
        .ht-cal-grid { display:grid; gap:4px; align-items:center; }
        .ht-cal-hd { font-size:0.68rem; font-weight:700; text-align:center; color:var(--muted-foreground); padding:2px 0; }
        .ht-cal-habit-label { display:flex; align-items:center; justify-content:center; }
        .ht-cal-icon { width:18px; height:18px; border-radius:4px; display:flex; align-items:center; justify-content:center; }
        .ht-cal-cell { display:flex; align-items:center; justify-content:center; }
        .ht-cal-dot { width:12px; height:12px; border-radius:3px; display:block; }
        .ht-cal-legend { display:flex; align-items:center; gap:4px; margin-top:8px; justify-content:flex-end; }
        .ht-cal-leg-label { font-size:0.68rem; color:var(--muted-foreground); }
        .ht-cal-leg-dot { width:10px; height:10px; border-radius:2px; }

        .ht-insight-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:12px; }
        .ht-insight-col {}
        .ht-insight-lbl { font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--muted-foreground); margin-bottom:6px; }
        .ht-insight-item { display:flex; align-items:center; gap:6px; }
        .ht-insight-name { font-size:0.75rem; font-weight:700; color:var(--foreground); flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ht-insight-bar-wrap { width:60px; height:5px; border-radius:99px; background:var(--muted); overflow:hidden; flex-shrink:0; }
        .ht-insight-bar { height:100%; border-radius:99px; }
        .ht-insight-pct { font-size:0.72rem; font-weight:800; color:var(--muted-foreground); flex-shrink:0; }
        .ht-tip-box { display:flex; align-items:flex-start; gap:8px; padding:10px 12px; border-radius:12px; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); }
        .ht-tip-text { font-size:0.78rem; color:var(--foreground); line-height:1.5; }

        .ht-qa-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:4px; }
        .ht-qa-btn { display:flex; align-items:center; gap:6px; padding:10px 12px; border-radius:10px; font-size:0.78rem; font-weight:700; cursor:pointer; }

        /* modal */
        .ht-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); }
        .ht-modal { background:var(--card); border:1px solid var(--border); border-radius:24px; width:100%; max-width:440px; margin:16px; box-shadow:0 24px 64px rgba(0,0,0,0.25); animation:htSlide .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes htSlide { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .ht-modal-hd { display:flex; align-items:flex-start; justify-content:space-between; padding:22px 22px 0; }
        .ht-modal-title { font-size:1.1rem; font-weight:900; color:var(--foreground); }
        .ht-modal-sub { font-size:0.78rem; color:var(--muted-foreground); margin-top:2px; }
        .ht-modal-body { padding:18px 22px 22px; display:flex; flex-direction:column; gap:12px; }
        .ht-modal-ft { display:flex; gap:10px; justify-content:flex-end; margin-top:4px; }
        .ht-field { display:flex; flex-direction:column; gap:5px; }
        .ht-label { font-size:0.72rem; font-weight:700; color:var(--muted-foreground); text-transform:uppercase; letter-spacing:.05em; }
        .ht-input { height:40px; border-radius:10px; border:1.5px solid var(--border); background:var(--muted); padding:0 12px; font-size:0.85rem; color:var(--foreground); outline:none; }
        .ht-input:focus { border-color:var(--primary); }
        .ht-sel { appearance:none; cursor:pointer; }
        .ht-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      `}</style>
    </>
  );
}
