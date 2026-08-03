"use client";

import {
  Activity, Award, Bookmark, Briefcase, Camera,
  CheckCircle2, ChevronLeft, ChevronRight, Clock,
  Code2, Cpu, Edit3, ExternalLink, Flame,
  Globe, Link2, Mail, MapPin, Phone, Save,
  Shield, Star, Target, Timer, Trophy, TrendingUp,
  User, Zap, Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/app/page-header";

/* ─── helpers ──────────────────────────────────────────────────── */
function load<T>(key: string): T[] {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}
function loadObj<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function fmt(m: number) {
  const h = Math.floor(m / 60), mn = m % 60;
  return h > 0 ? `${h}h${mn > 0 ? ` ${mn}m` : ""}` : `${mn}m`;
}

/* ─── streak calendar ──────────────────────────────────────────── */
function StreakCalendar() {
  const [month] = useState(new Date());
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });
  const today = new Date().getDate();
  return (
    <div className="pf-cal-wrap">
      <div className="pf-cal-nav">
        <button className="pf-cal-nav-btn"><ChevronLeft size={14} /></button>
        <span className="pf-cal-month">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
        <button className="pf-cal-nav-btn"><ChevronRight size={14} /></button>
      </div>
      <div className="pf-cal-grid">
        {days.map(d => <div key={d} className="pf-cal-hd">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`pf-cal-cell ${d ? (d < today ? "pf-cal-done" : d === today ? "pf-cal-today" : "pf-cal-future") : "pf-cal-empty"}`}>
            {d && <span>{d}</span>}
          </div>
        ))}
      </div>
      <div className="pf-cal-legend">
        <span>Less</span>
        {["0.2", "0.5", "0.8", "1"].map(o => <span key={o} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(22,97,79,${o})`, display: "inline-block" }} />)}
        <span>More</span>
      </div>
    </div>
  );
}

/* ─── Weekly activity chart ────────────────────────────────────── */
function WeeklyChart({ sessions }: { sessions: { durationMinutes: number }[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const total = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const data = days.map((day, i) => ({
    day,
    hours: +(Math.max(0, (total / 60) * (i + 1) / 7 + (i % 2 === 0 ? 0.5 : 0) - (i === 5 ? 1 : 0))).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
          formatter={(v) => [`${v}h`, "Hours"]} />
        <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2.5}
          fill="url(#pfGrad)" dot={{ fill: "var(--primary)", r: 3 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Time distribution donut ──────────────────────────────────── */
function TimeDistDonut({ sessions }: { sessions: { durationMinutes: number, mode: string }[] }) {
  const total = sessions.reduce((s, x) => s + x.durationMinutes, 0) || 1;
  const coding = sessions.filter(s => s.mode === "Coding Session").reduce((s, x) => s + x.durationMinutes, 0);
  const study = sessions.filter(s => s.mode === "Study Session").reduce((s, x) => s + x.durationMinutes, 0);
  const project = sessions.filter(s => s.mode === "Deep Work").reduce((s, x) => s + x.durationMinutes, 0);
  const other = total - coding - study - project;
  const data = [
    { name: "Coding", value: Math.round(coding / total * 100) || 45, color: "var(--primary)" },
    { name: "Study", value: Math.round(study / total * 100) || 25, color: "#6366f1" },
    { name: "Project", value: Math.round(project / total * 100) || 15, color: "#f59e0b" },
    { name: "Other", value: Math.round(other / total * 100) || 15, color: "#aeb7a7" },
  ];
  return (
    <div style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
            formatter={(v) => [`${v}%`]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--foreground)" }}>{fmt(total)}</span>
        <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>Total</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--foreground)", fontWeight: 600 }}>{d.name}</span>
            <span style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"Overview" | "Targets" | "Account" | "Security" | "Integrations" | "Preferences">("Overview");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Rahul Kumar");
  const [email, setEmail] = useState("rahulkumar@example.com");
  const [phone, setPhone] = useState("+91 9999999999");
  const [location, setLocation] = useState("Bihar, India");
  const [website, setWebsite] = useState("devtrack.ai/@rahul");
  const [bio, setBio] = useState("Student Developer · Building habits & mastering code one day at a time.");
  const [tasks, setTasks] = useState<{ status: string; category: string }[]>([]);
  const [habits, setHabits] = useState<{ streak: number; title: string; completedToday: boolean }[]>([]);
  const [sessions, setSessions] = useState<{ durationMinutes: number; mode: string }[]>([]);
  const [goals, setGoals] = useState<{ progress: number; title: string }[]>([]);
  const [activities, setActivities] = useState<{ type: string; description: string; createdAt: string }[]>([]);
  const [dsaProgress, setDsaProgress] = useState<Record<string, string>>({});

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(load("devtrack_tasks"));
    setHabits(load("devtrack_habits"));
    setSessions(load("devtrack_sessions"));
    setGoals(load("devtrack_goals"));
    setActivities(load("devtrack_activities"));
    setDsaProgress(loadObj<Record<string, string>>("devtrack_dsa_progress") ?? {});
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d?.name) setName(d.name);
      if (d?.email) setEmail(d.email);
      if (d?.avatarUrl) setAvatarUrl(d.avatarUrl);
    }).catch(() => { });
  }, []);

  /** Handle photo file selection → compress to base64 → upload */
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setAvatarError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB");
      return;
    }

    setAvatarUploading(true);

    try {
      // Read & compress the image via canvas
      const base64 = await compressImage(file, 400);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAvatarError(data.error ?? "Upload failed");
      } else {
        setAvatarUrl(data.avatarUrl);
      }
    } catch {
      setAvatarError("Upload failed. Check your connection and try again.");
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** Compress an image file to a base64 data URL, max `size` px on longest side */
  function compressImage(file: File, size: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        const ratio = Math.min(size / img.width, size / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = url;
    });
  }

  function save2(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const totalFocus = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const goalsAchieved = goals.filter(g => g.progress >= 100).length;
  const prodScore = Math.min(99, Math.round(
    (completedTasks * 2 + (totalFocus / 60) * 3 + bestStreak * 4 + goalsAchieved * 5) /
    Math.max(1, tasks.length * 0.2 + sessions.length * 0.3 + habits.length * 0.4 + goals.length * 0.5) * 10
  )) || 87;

  const TABS = ["Overview", "Targets", "Account", "Security", "Integrations", "Preferences"] as const;
  const BADGES = [
    { icon: "🔥", label: "7 Day Streak" }, { icon: "⚡", label: "Focus Master" },
    { icon: "🏆", label: "DSA Enthusiast" }, { icon: "📚", label: "Early Bird" },
  ];
  const ACHIEVEMENTS = [
    { icon: Flame, label: "7 Days Streak", sub: "Maintain a 7-day streak", color: "#f59e0b", date: "2 May 2025" },
    { icon: Timer, label: "Focus Master", sub: "Complete 10 focus sessions", color: "#6366f1", date: "28 Apr 2025" },
    { icon: Code2, label: "DSA Enthusiast", sub: "Solve 100 DSA problems", color: "#14b8a6", date: "25 Apr 2025" },
    { icon: Clock, label: "Early Bird", sub: "Maintain early routine for 5 days", color: "#22c55e", date: "20 Apr 2025" },
  ];

  const catBreakdown = Object.entries(
    tasks.reduce((a, t) => { a[t.category] = (a[t.category] || 0) + 1; return a; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);
  const CAT_COLORS: Record<string, string> = { Coding: "#22c55e", Study: "#6366f1", Learning: "#8b5cf6", Health: "#ef4444", Other: "#aeb7a7" };

  const MOTIVATIONS = ["Discipline today leads to freedom tomorrow.", "Small steps. Big wins.", "Code. Study. Repeat."];
  const quote = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  return (
    <>
      <PageHeader title="My Profile" description="Manage your profile, track your progress, and stay consistent." />

      {/* tabs */}
      <div className="pf-tabs">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`pf-tab ${activeTab === t ? "pf-tab-active" : ""}`}>
            {t === "Overview" && <User size={13} />}
            {t === "Targets" && <Target size={13} />}
            {t === "Account" && <Edit3 size={13} />}
            {t === "Security" && <Shield size={13} />}
            {t === "Integrations" && <Link2 size={13} />}
            {t === "Preferences" && <Zap size={13} />}
            {t}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {activeTab === "Overview" && (
        <div className="pf-overview-grid">

          {/* left aside */}
          <div className="pf-aside">
            {/* avatar card */}
            <div className="pf-avatar-card">
              <div className="pf-avatar-ring">
                <div className="pf-avatar-circle">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={name}
                      width={84}
                      height={84}
                      className="pf-avatar-img"
                      style={{ borderRadius: "50%", objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <User size={44} strokeWidth={1.5} />
                  )}
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <button
                  className="pf-avatar-cam"
                  aria-label="Change avatar"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? <Loader2 size={14} className="pf-spin" /> : <Camera size={14} />}
                </button>
              </div>
              {avatarError && (
                <p style={{ fontSize: "0.7rem", color: "#ef4444", textAlign: "center", margin: "0 0 4px" }}>
                  {avatarError}
                </p>
              )}
              {avatarUploading && (
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textAlign: "center" }}>
                  Uploading…
                </p>
              )}
              <p className="pf-avatar-name">{name}</p>
              <p className="pf-avatar-role">Student Developer</p>
              <span className="pf-avatar-badge"><Shield size={10} /> Active Member</span>
              <div className="pf-avatar-meta">
                <div className="pf-meta-row"><Mail size={13} /><span>{email}</span></div>
                <div className="pf-meta-row"><Phone size={13} /><span>{phone}</span></div>
                <div className="pf-meta-row"><MapPin size={13} /><span>{location}</span></div>
                <div className="pf-meta-row"><Globe size={13} /><span>{website}</span></div>
              </div>
              <button className="pf-edit-btn" onClick={() => setActiveTab("Account")}><Edit3 size={13} /> Edit Profile</button>
            </div>

            {/* level card */}
            <div className="pf-level-card">
              <div className="pf-level-hd">
                <div><span className="pf-level-badge">Level 12</span><span className="pf-pro-badge">Pro</span></div>
                <button className="pf-icon-btn" style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>✕</button>
              </div>
              <p className="pf-level-sub">Keep going! You&apos;re doing great.</p>
              <div className="pf-xp-bar-wrap"><div className="pf-xp-bar" style={{ width: "65%" }} /></div>
              <p className="pf-xp-text">3,250 / 5,000 XP</p>
            </div>

            {/* badges */}
            <div className="pf-panel">
              <div className="pf-panel-hd"><p className="pf-panel-title">Badges Earned</p><button className="pf-link">View All</button></div>
              <div className="pf-badges-row">
                {BADGES.map(b => <span key={b.label} title={b.label} className="pf-badge-icon">{b.icon}</span>)}
                <span className="pf-badge-more">+8</span>
              </div>
            </div>

            {/* quote */}
            <div className="pf-panel pf-quote-card">
              <span className="pf-qq">&ldquo;</span>
              <p className="pf-quote">{quote}</p>
              <p className="pf-quote-by">— Unknown</p>
            </div>
          </div>

          {/* center + right */}
          <div className="pf-center-right">

            {/* top stat cards */}
            <div className="pf-top-stats">
              {[
                { l: "Productivity Score", v: `${prodScore}%`, sub: "Excellent", c: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: TrendingUp, extra: "↑ 12% vs last week" },
                { l: "Total Tasks Done", v: completedTasks, sub: "Completed", c: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: CheckCircle2, extra: "↑ 18% vs last week" },
                { l: "Focus Time", v: fmt(totalFocus), sub: "This Week", c: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Timer, extra: "↑ 22% vs last week" },
                { l: "Goals Achieved", v: `${goalsAchieved}/${goals.length || 12}`, sub: "This Month", c: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: Trophy, extra: "↑ 25% vs last month" },
              ].map(s => (
                <div key={s.l} className="pf-top-stat">
                  <div className="pf-ts-icon" style={{ background: s.bg, color: s.c }}><s.icon size={20} /></div>
                  <div>
                    <p className="pf-ts-label">{s.l}</p>
                    <p className="pf-ts-value">{s.v}</p>
                    <p className="pf-ts-sub">{s.sub}</p>
                  </div>
                  <p className="pf-ts-extra" style={{ color: s.c }}>{s.extra}</p>
                </div>
              ))}
            </div>

            {/* activity + time dist */}
            <div className="pf-mid-grid">
              <div className="pf-panel">
                <div className="pf-panel-hd">
                  <p className="pf-panel-title">Weekly Activity Overview</p>
                  <span className="pf-badge-pill">This Week</span>
                </div>
                <WeeklyChart sessions={sessions} />
              </div>
              <div className="pf-panel">
                <p className="pf-panel-title">Time Distribution</p>
                <TimeDistDonut sessions={sessions} />
              </div>
            </div>

            {/* streak calendar + achievements + top categories */}
            <div className="pf-bottom-grid">
              <div className="pf-panel">
                <div className="pf-panel-hd">
                  <p className="pf-panel-title">Streak Calendar</p>
                  <button className="pf-link">View Full</button>
                </div>
                <StreakCalendar />
              </div>

              <div className="pf-panel">
                <div className="pf-panel-hd"><p className="pf-panel-title">Recent Achievements</p><button className="pf-link">View All</button></div>
                {ACHIEVEMENTS.map(a => (
                  <div key={a.label} className="pf-achieve-row">
                    <div className="pf-achieve-icon" style={{ background: `${a.color}18`, color: a.color }}><a.icon size={16} /></div>
                    <div className="pf-achieve-body"><p className="pf-achieve-label">{a.label}</p><p className="pf-achieve-sub">{a.sub}</p></div>
                    <span className="pf-achieve-date">{a.date}</span>
                  </div>
                ))}
              </div>

              <div className="pf-panel">
                <div className="pf-panel-hd"><p className="pf-panel-title">Top Categories</p><button className="pf-link">View All</button></div>
                {(catBreakdown.length ? catBreakdown : [["Coding", 15], ["Study", 10], ["Learning", 6], ["Health", 4], ["Mindset", 3]]).slice(0, 5).map(([cat, cnt]) => (
                  <div key={cat} className="pf-cat-row">
                    <span className="pf-cat-label">{cat}</span>
                    <div className="pf-cat-bar-wrap">
                      <div className="pf-cat-bar" style={{ width: `${Math.round(Number(cnt) / (tasks.length || 28) * 100)}%`, background: CAT_COLORS[cat as string] ?? "#aeb7a7" }} />
                    </div>
                    <span className="pf-cat-pct" style={{ color: CAT_COLORS[cat as string] ?? "#aeb7a7" }}>{Math.round(Number(cnt) / (tasks.length || 28) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* activity timeline */}
            <div className="pf-panel">
              <div className="pf-panel-hd"><p className="pf-panel-title">Activity Timeline</p><button className="pf-link">View All</button></div>
              <div className="pf-timeline-grid">
                {(activities.length ? activities.slice(0, 6) : [
                  { description: "Completed 5 DSA problems", type: "Coding", createdAt: new Date().toISOString() },
                  { description: "Gym workout completed", type: "Health", createdAt: new Date(Date.now() - 3600000).toISOString() },
                  { description: "Read 20 pages of system design", type: "Learning", createdAt: new Date(Date.now() - 7200000).toISOString() },
                  { description: "Focus session: 60 minutes", type: "Focus", createdAt: new Date(Date.now() - 86400000).toISOString() },
                  { description: "Solved Array problems", type: "Coding", createdAt: new Date(Date.now() - 172800000).toISOString() },
                  { description: "Morning meditation", type: "Mindset", createdAt: new Date(Date.now() - 259200000).toISOString() },
                ]).map((a, i) => (
                  <div key={i} className="pf-tl-item">
                    <div className="pf-tl-dot" style={{ background: CAT_COLORS[a.type] ?? "var(--primary)" }} />
                    <div className="pf-tl-body">
                      <p className="pf-tl-title">{a.description}</p>
                      <span className="pf-tl-tag" style={{ background: `${CAT_COLORS[a.type] ?? "var(--primary)"}15`, color: CAT_COLORS[a.type] ?? "var(--primary)" }}>{a.type}</span>
                    </div>
                    <span className="pf-tl-time">{new Date(a.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ACCOUNT ══ */}
      {activeTab === "Account" && (
        <form onSubmit={save2} className="pf-form-card">
          <div className="pf-form-section">
            <h3 className="pf-form-section-title"><Edit3 size={15} /> Personal Information</h3>
            <div className="pf-form-grid">
              {[{ id: "pf-name", label: "Full Name", icon: User, val: name, set: setName, ph: "Your full name" },
              { id: "pf-email", label: "Email Address", icon: Mail, val: email, set: setEmail, ph: "you@email.com" },
              { id: "pf-phone", label: "Phone", icon: Phone, val: phone, set: setPhone, ph: "+91 9999999999" },
              { id: "pf-loc", label: "Location", icon: MapPin, val: location, set: setLocation, ph: "City, Country" },
              { id: "pf-role", label: "Profession", icon: Briefcase, val: "Student Developer", set: () => { }, ph: "Your role" },
              { id: "pf-web", label: "Website", icon: Globe, val: website, set: setWebsite, ph: "yourdomain.com" },
              ].map(f => (
                <div key={f.id} className="pf-field">
                  <label className="pf-field-label"><f.icon size={12} /> {f.label}</label>
                  <input className="pf-field-input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                </div>
              ))}
              <div className="pf-field pf-span2">
                <label className="pf-field-label"><Edit3 size={12} /> Bio</label>
                <textarea className="pf-field-input pf-ta" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <div className="pf-form-footer">
            <button type="submit" className={`pf-save-btn ${saved ? "pf-saved" : ""}`}>
              {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
            <span className="pf-save-hint">Changes are saved securely.</span>
          </div>
        </form>
      )}

      {/* ══ TARGETS ══ */}
      {activeTab === "Targets" && (
        <div className="pf-form-card">
          <div className="pf-form-section">
            <h3 className="pf-form-section-title"><Target size={15} /> Daily Targets</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: 20 }}>Set your daily goals for study, coding, and fitness.</p>
            <div className="pf-form-grid">
              {[
                { l: "Daily Study Hours", c: "#5ec4a8", val: 3, unit: "hrs" },
                { l: "Daily Coding Hours", c: "#f18b67", val: 4, unit: "hrs" },
                { l: "Daily Gym Time", c: "#74d2bb", val: 60, unit: "min" },
                { l: "Focus Sessions", c: "#a78bfa", val: 4, unit: "sessions" },
              ].map(t => (
                <div key={t.l} className="pf-target-card" style={{ "--tc": t.c } as React.CSSProperties}>
                  <p className="pf-target-label" style={{ color: t.c }}>{t.l}</p>
                  <div className="pf-target-row">
                    <input type="number" defaultValue={t.val} className="pf-target-input" />
                    <span className="pf-target-unit">/ day ({t.unit})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pf-form-footer">
            <button className="pf-save-btn"><Save size={16} /> Save Targets</button>
          </div>
        </div>
      )}

      {/* ══ SECURITY ══ */}
      {(activeTab === "Security" || activeTab === "Integrations" || activeTab === "Preferences") && (
        <div className="pf-form-card">
          <div className="pf-form-section">
            <h3 className="pf-form-section-title"><Shield size={15} /> {activeTab} Settings</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>This section is coming soon. Your data is safe and secure.</p>
          </div>
        </div>
      )}

      <style>{`
        /* tabs */
        .pf-tabs{display:flex;gap:2px;background:var(--muted);border-radius:14px;padding:4px;margin-bottom:20px;flex-wrap:wrap;}
        .pf-tab{display:flex;align-items:center;gap:5px;flex:1;height:34px;justify-content:center;border-radius:10px;border:none;background:transparent;color:var(--muted-foreground);font-size:.78rem;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s;}
        .pf-tab-active{background:var(--card);color:var(--foreground);font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.1);}

        /* overview grid */
        .pf-overview-grid{display:grid;grid-template-columns:260px 1fr;gap:18px;align-items:start;}
        @media(max-width:900px){.pf-overview-grid{grid-template-columns:1fr;}}

        /* aside */
        .pf-aside{display:flex;flex-direction:column;gap:14px;}
        .pf-avatar-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:24px 18px;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .pf-avatar-ring{position:relative;width:90px;height:90px;border-radius:50%;background:conic-gradient(from 0deg,#5ec4a8,#16614f,#5ec4a8);padding:3px;animation:pfSpin 8s linear infinite;}
        @keyframes pfSpin{to{transform:rotate(360deg)}}
        .pf-avatar-circle{width:100%;height:100%;border-radius:50%;background:var(--muted);display:grid;place-items:center;color:var(--muted-foreground);}
        .pf-avatar-cam{position:absolute;bottom:2px;right:2px;width:26px;height:26px;border-radius:50%;background:#5ec4a8;color:#07110e;border:2px solid var(--card);display:grid;place-items:center;cursor:pointer;}
        .pf-avatar-cam:disabled{opacity:0.6;cursor:not-allowed;}
        @keyframes pfSpinIcon{to{transform:rotate(360deg)}}
        .pf-spin{animation:pfSpinIcon .8s linear infinite;}
        .pf-avatar-name{font-size:1rem;font-weight:800;color:var(--foreground);text-align:center;}
        .pf-avatar-role{font-size:.75rem;color:var(--muted-foreground);}
        .pf-avatar-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;background:rgba(94,196,168,.12);color:#5ec4a8;font-size:.7rem;font-weight:600;border:1px solid rgba(94,196,168,.25);}
        .pf-avatar-meta{width:100%;display:flex;flex-direction:column;gap:7px;padding-top:10px;border-top:1px solid var(--border);}
        .pf-meta-row{display:flex;align-items:center;gap:7px;font-size:.75rem;color:var(--muted-foreground);}
        .pf-meta-row svg{color:var(--primary);flex-shrink:0;}
        .pf-edit-btn{display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;background:var(--muted);border:1px solid var(--border);color:var(--foreground);font-size:.78rem;font-weight:600;cursor:pointer;margin-top:4px;}
        .pf-edit-btn:hover{background:var(--background);}

        .pf-level-card{background:linear-gradient(135deg,#181b16,#1e2419);border:1px solid rgba(94,196,168,.2);border-radius:18px;padding:16px;}
        .pf-level-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
        .pf-level-badge{font-size:.82rem;font-weight:800;color:var(--foreground);}
        .pf-pro-badge{font-size:.65rem;font-weight:800;padding:2px 7px;border-radius:6px;background:rgba(94,196,168,.2);color:#5ec4a8;margin-left:6px;}
        .pf-level-sub{font-size:.72rem;color:var(--muted-foreground);margin-bottom:10px;}
        .pf-xp-bar-wrap{height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin-bottom:4px;}
        .pf-xp-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,#16614f,#5ec4a8);}
        .pf-xp-text{font-size:.72rem;color:rgba(255,255,255,.5);}

        .pf-panel{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:16px;}
        .pf-panel-title{font-size:.88rem;font-weight:800;color:var(--foreground);}
        .pf-panel-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .pf-panel-hd .pf-panel-title{margin-bottom:0;}
        .pf-link{font-size:.72rem;font-weight:700;color:var(--primary);background:none;border:none;cursor:pointer;}
        .pf-badge-pill{font-size:.68rem;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--muted);color:var(--muted-foreground);}
        .pf-icon-btn{background:none;border:none;cursor:pointer;color:var(--muted-foreground);}

        .pf-badges-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
        .pf-badge-icon{font-size:1.8rem;}
        .pf-badge-more{font-size:.78rem;font-weight:800;color:var(--muted-foreground);}

        .pf-quote-card{background:linear-gradient(135deg,rgba(22,97,79,.08),rgba(94,196,168,.05));border-color:rgba(22,97,79,.2);}
        .pf-qq{font-size:2rem;line-height:1;color:var(--primary);opacity:.5;font-family:Georgia,serif;}
        .pf-quote{font-size:.82rem;font-weight:700;font-style:italic;color:var(--foreground);margin:4px 0;}
        .pf-quote-by{font-size:.72rem;color:var(--muted-foreground);}

        /* top stats */
        .pf-top-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px;}
        @media(max-width:900px){.pf-top-stats{grid-template-columns:repeat(2,1fr);}}
        .pf-top-stat{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:6px;}
        .pf-ts-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;}
        .pf-ts-label{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);}
        .pf-ts-value{font-size:1.5rem;font-weight:900;color:var(--foreground);line-height:1;}
        .pf-ts-sub{font-size:.68rem;color:var(--muted-foreground);}
        .pf-ts-extra{font-size:.7rem;font-weight:700;margin-top:2px;}

        /* mid grid */
        .pf-mid-grid{display:grid;grid-template-columns:1fr 220px;gap:14px;margin-bottom:14px;}
        @media(max-width:800px){.pf-mid-grid{grid-template-columns:1fr;}}

        /* bottom grid */
        .pf-bottom-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px;}
        @media(max-width:900px){.pf-bottom-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:600px){.pf-bottom-grid{grid-template-columns:1fr;}}

        /* streak calendar */
        .pf-cal-wrap{}
        .pf-cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .pf-cal-nav-btn{background:none;border:none;cursor:pointer;color:var(--muted-foreground);padding:4px;}
        .pf-cal-month{font-size:.82rem;font-weight:700;color:var(--foreground);}
        .pf-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
        .pf-cal-hd{font-size:.62rem;font-weight:700;text-align:center;color:var(--muted-foreground);padding:2px 0;}
        .pf-cal-cell{aspect-ratio:1;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:600;}
        .pf-cal-empty{}
        .pf-cal-done{background:rgba(22,97,79,.5);color:rgba(255,255,255,.8);}
        .pf-cal-today{background:var(--primary);color:var(--primary-foreground);font-weight:800;}
        .pf-cal-future{color:var(--muted-foreground);}
        .pf-cal-legend{display:flex;align-items:center;gap:4px;margin-top:8px;justify-content:flex-end;font-size:.65rem;color:var(--muted-foreground);}

        /* achievements */
        .pf-achieve-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);}
        .pf-achieve-row:last-child{border-bottom:none;}
        .pf-achieve-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .pf-achieve-body{flex:1;min-width:0;}
        .pf-achieve-label{font-size:.82rem;font-weight:700;color:var(--foreground);}
        .pf-achieve-sub{font-size:.68rem;color:var(--muted-foreground);}
        .pf-achieve-date{font-size:.68rem;color:var(--muted-foreground);flex-shrink:0;}

        /* top categories */
        .pf-cat-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
        .pf-cat-label{font-size:.78rem;font-weight:700;color:var(--foreground);width:64px;flex-shrink:0;}
        .pf-cat-bar-wrap{flex:1;height:7px;border-radius:99px;background:var(--muted);overflow:hidden;}
        .pf-cat-bar{height:100%;border-radius:99px;transition:width .5s;}
        .pf-cat-pct{font-size:.72rem;font-weight:800;width:32px;text-align:right;flex-shrink:0;}

        /* activity timeline */
        .pf-timeline-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
        @media(max-width:600px){.pf-timeline-grid{grid-template-columns:1fr;}}
        .pf-tl-item{display:flex;align-items:flex-start;gap:8px;padding:8px;border-radius:10px;background:var(--muted);}
        .pf-tl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
        .pf-tl-body{flex:1;min-width:0;}
        .pf-tl-title{font-size:.78rem;font-weight:700;color:var(--foreground);}
        .pf-tl-tag{font-size:.65rem;font-weight:700;padding:2px 6px;border-radius:5px;margin-top:3px;display:inline-block;}
        .pf-tl-time{font-size:.68rem;color:var(--muted-foreground);flex-shrink:0;white-space:nowrap;}

        /* form */
        .pf-form-card{background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;}
        .pf-form-section{padding:24px;}
        .pf-form-section-title{display:flex;align-items:center;gap:8px;font-size:.95rem;font-weight:800;color:var(--foreground);margin-bottom:18px;}
        .pf-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:600px){.pf-form-grid{grid-template-columns:1fr;}}
        .pf-span2{grid-column:span 2;}
        @media(max-width:600px){.pf-span2{grid-column:span 1;}}
        .pf-field{display:flex;flex-direction:column;gap:5px;}
        .pf-field-label{display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted-foreground);}
        .pf-field-label svg{color:var(--primary);}
        .pf-field-input{height:42px;border-radius:12px;border:1.5px solid var(--border);background:var(--background);padding:0 14px;font-size:.88rem;color:var(--foreground);outline:none;transition:border-color .15s;}
        .pf-field-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent);}
        .pf-ta{height:auto;padding:12px 14px;resize:vertical;}
        .pf-form-footer{display:flex;align-items:center;gap:14px;padding:16px 24px;background:var(--muted);border-top:1px solid var(--border);}
        .pf-save-btn{display:flex;align-items:center;gap:7px;height:42px;padding:0 22px;border-radius:12px;background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 70%,#5ec4a8));color:var(--primary-foreground);font-size:.88rem;font-weight:700;border:none;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 14px rgba(22,97,79,.3);}
        .pf-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,97,79,.4);}
        .pf-saved{background:linear-gradient(135deg,#16a34a,#4ade80);}
        .pf-save-hint{font-size:.72rem;color:var(--muted-foreground);}

        /* targets */
        .pf-target-card{border-radius:14px;padding:14px;border:1.5px solid var(--border);background:var(--background);display:flex;flex-direction:column;gap:10px;}
        .pf-target-label{font-size:.78rem;font-weight:700;}
        .pf-target-row{display:flex;align-items:center;gap:8px;}
        .pf-target-input{width:70px;height:36px;border-radius:8px;border:1px solid var(--border);background:var(--card);padding:0 8px;font-size:1rem;font-weight:800;color:var(--foreground);outline:none;text-align:center;}
        .pf-target-unit{font-size:.72rem;color:var(--muted-foreground);}

        /* center-right */
        .pf-center-right{display:flex;flex-direction:column;gap:0;}
      `}</style>
    </>
  );
}
