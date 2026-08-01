"use client";

import {
    BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight,
    ChevronUp, Code2, Copy, ExternalLink, Filter,
    RotateCcw, Search, Sparkles, Star, Trophy, X, Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DSA_CATEGORIES } from "@/data/dsa-questions";
import type { DSACategory, DSAQuestion, Difficulty } from "@/data/dsa-questions";

/* ─── Storage ──────────────────────────────────────────────────── */
const STORAGE_KEY = "devtrack_dsa_progress";
type Progress = Record<string, "solved" | "review" | "unsolved">;

function loadProgress(): Progress {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; }
    catch { return {}; }
}
function saveProgress(p: Progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /**/ }
}

/* ─── Constants ────────────────────────────────────────────────── */
const DIFF_COLOR: Record<Difficulty, string> = {
    Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444",
};
const DIFF_BG: Record<Difficulty, string> = {
    Easy: "rgba(34,197,94,0.12)", Medium: "rgba(245,158,11,0.12)", Hard: "rgba(239,68,68,0.12)",
};

function totalQuestions() {
    return DSA_CATEGORIES.reduce((s, c) => s + c.questions.length, 0);
}

/* ─── Toast Popup ──────────────────────────────────────────────── */
type ToastData = { title: string; subtitle: string; icon: React.ReactNode; color: string; bg: string } | null;

function Toast({ data, onDone }: { data: ToastData; onDone: () => void }) {
    useEffect(() => {
        if (!data) return;
        const t = setTimeout(onDone, 2600);
        return () => clearTimeout(t);
    }, [data, onDone]);

    if (!data) return null;

    return (
        <div
            className="fixed bottom-6 left-1/2 z-[9999] flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
                transform: "translateX(-50%)",
                background: "var(--card)",
                border: `1.5px solid ${data.color}40`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px ${data.color}20`,
                minWidth: 280,
                animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
        >
            <div
                className="flex size-11 items-center justify-center rounded-xl shrink-0"
                style={{ background: data.bg }}
            >
                {data.icon}
            </div>
            <div>
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{data.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{data.subtitle}</p>
            </div>
            <div
                className="ml-auto h-1 rounded-full overflow-hidden"
                style={{ width: 3, background: `${data.color}30`, alignSelf: "stretch" }}
            >
                <div className="w-full rounded-full" style={{ background: data.color, height: "100%", animation: "toastBar 2.6s linear forwards" }} />
            </div>
        </div>
    );
}

/* ─── Code Block ───────────────────────────────────────────────── */
function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    }
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0d1117", border: "1px solid #30363d" }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid #30363d", background: "#161b22" }}>
                <div className="flex gap-2">
                    <span className="size-3 rounded-full" style={{ background: "#ff5f57" }} />
                    <span className="size-3 rounded-full" style={{ background: "#febc2e" }} />
                    <span className="size-3 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "#8b949e" }}>JavaScript</span>
                <button onClick={copy}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all"
                    style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", color: copied ? "#22c55e" : "#8b949e" }}>
                    {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed m-0"
                style={{ color: "#e6edf3", fontFamily: "'Geist Mono','Fira Code','Consolas',monospace" }}>
                <code>{code}</code>
            </pre>
        </div>
    );
}

/* ─── Question Card ────────────────────────────────────────────── */
interface QuestionCardProps {
    q: DSAQuestion;
    status: "solved" | "review" | "unsolved";
    onStatusChange: (id: string, s: "solved" | "review" | "unsolved", title: string) => void;
    index: number;
}

function QuestionCard({ q, status, onStatusChange, index }: QuestionCardProps) {
    const [open, setOpen] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const nextStatus = useCallback(() => {
        const cycle: Array<"unsolved" | "review" | "solved"> = ["unsolved", "review", "solved"];
        const next = cycle[(cycle.indexOf(status) + 1) % 3];
        onStatusChange(q.id, next, q.title);
    }, [status, q.id, q.title, onStatusChange]);

    const isSolved = status === "solved";
    const isReview = status === "review";

    return (
        <div
            className="dsa-card"
            style={{
                "--card-accent": isSolved ? "#22c55e" : isReview ? "#f59e0b" : "transparent",
            } as React.CSSProperties}
        >
            {/* solved glow strip */}
            {(isSolved || isReview) && (
                <div className="dsa-card-strip" style={{ background: isSolved ? "#22c55e" : "#f59e0b" }} />
            )}

            {/* ── Collapsed header ── */}
            <div className="dsa-card-header" onClick={() => setOpen(v => !v)}>
                {/* number badge */}
                <div className="dsa-num" style={{ background: isSolved ? "rgba(34,197,94,0.12)" : "var(--muted)", color: isSolved ? "#22c55e" : "var(--muted-foreground)" }}>
                    {isSolved ? <Check size={11} /> : String(index).padStart(2, "0")}
                </div>

                {/* title + difficulty */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: isSolved ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: isSolved ? "line-through" : "none" }}>
                            {q.title}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                            style={{ background: DIFF_BG[q.difficulty], color: DIFF_COLOR[q.difficulty] }}>
                            {q.difficulty}
                        </span>
                    </div>
                    {!open && (
                        <p className="mt-0.5 text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                            <span style={{ color: "#5ec4a8" }}>✦</span> {q.trick}
                        </p>
                    )}
                </div>

                {/* complexity - desktop only */}
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                    <span className="dsa-badge">T: {q.timeComplexity}</span>
                    <span className="dsa-badge">S: {q.spaceComplexity}</span>
                </div>

                {/* LeetCode mini link */}
                <a href={q.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="dsa-lc-btn shrink-0"
                    title="Open on LeetCode">
                    <ExternalLink size={11} />
                    <span className="hidden sm:inline">LC</span>
                </a>

                {/* Mark button */}
                <button
                    onClick={e => { e.stopPropagation(); nextStatus(); }}
                    className="dsa-mark-btn shrink-0"
                    style={{
                        background: isSolved ? "linear-gradient(135deg,#16614f,#22c55e)" : isReview ? "linear-gradient(135deg,#b45309,#f59e0b)" : "var(--muted)",
                        color: (isSolved || isReview) ? "#fff" : "var(--muted-foreground)",
                        boxShadow: isSolved ? "0 2px 12px rgba(34,197,94,0.3)" : isReview ? "0 2px 12px rgba(245,158,11,0.3)" : "none",
                    }}
                    aria-label="Toggle status"
                >
                    {isSolved && <><CheckCircle2 size={12} /> Solved</>}
                    {isReview && <><Star size={12} /> Review</>}
                    {status === "unsolved" && <>Mark</>}
                </button>

                <span style={{ color: "var(--muted-foreground)" }}>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
            </div>

            {/* ── Expanded body ── */}
            {open && (
                <div className="dsa-card-body">
                    {/* Memory Trick */}
                    <div className="dsa-insight-card" style={{ "--ins-color": "#5ec4a8", "--ins-bg": "rgba(94,196,168,0.07)" } as React.CSSProperties}>
                        <div className="dsa-insight-label">
                            <Sparkles size={13} style={{ color: "#5ec4a8" }} />
                            <span>Memory Trick</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--foreground)" }}>{q.trick}</p>
                    </div>

                    {/* Approach */}
                    <div className="dsa-insight-card" style={{ "--ins-color": "#818cf8", "--ins-bg": "rgba(99,102,241,0.07)" } as React.CSSProperties}>
                        <div className="dsa-insight-label">
                            <Zap size={13} style={{ color: "#818cf8" }} />
                            <span>Approach</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{q.approach}</p>
                    </div>

                    {/* Complexity row + LC button */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "var(--muted)" }}>
                            <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Time</span>
                            <span className="text-xs font-black" style={{ color: "var(--foreground)" }}>{q.timeComplexity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "var(--muted)" }}>
                            <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Space</span>
                            <span className="text-xs font-black" style={{ color: "var(--foreground)" }}>{q.spaceComplexity}</span>
                        </div>
                        <a href={q.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all hover:scale-105"
                            style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
                            <ExternalLink size={13} />
                            Solve on LeetCode ↗
                        </a>
                    </div>

                    {/* Code toggle */}
                    <button
                        onClick={() => setShowCode(v => !v)}
                        className="flex items-center gap-2 w-full justify-center rounded-xl py-2.5 text-xs font-bold transition-all"
                        style={{
                            background: showCode ? "var(--primary)" : "var(--muted)",
                            color: showCode ? "var(--primary-foreground)" : "var(--foreground)",
                        }}>
                        <Code2 size={13} />
                        {showCode ? "Hide Code" : "View Solution Code"}
                        {showCode ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {showCode && <CodeBlock code={q.code} />}
                </div>
            )}
        </div>
    );
}

/* ─── Category Section ─────────────────────────────────────────── */
interface CategorySectionProps {
    category: DSACategory;
    progress: Progress;
    onStatusChange: (id: string, s: "solved" | "review" | "unsolved", title: string) => void;
    searchQuery: string;
    filterDiff: Difficulty | "All";
    filterStatus: "All" | "solved" | "review" | "unsolved";
    globalIndex: number;
}
function CategorySection({ category, progress, onStatusChange, searchQuery, filterDiff, filterStatus, globalIndex }: CategorySectionProps) {
    const [collapsed, setCollapsed] = useState(false);

    const filtered = useMemo(() => category.questions.filter(q => {
        const ms = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.trick.toLowerCase().includes(searchQuery.toLowerCase());
        const md = filterDiff === "All" || q.difficulty === filterDiff;
        const mst = filterStatus === "All" || (progress[q.id] || "unsolved") === filterStatus;
        return ms && md && mst;
    }), [category.questions, searchQuery, filterDiff, filterStatus, progress]);

    if (filtered.length === 0) return null;

    const solved = filtered.filter(q => progress[q.id] === "solved").length;
    const review = filtered.filter(q => progress[q.id] === "review").length;
    const pct = Math.round((solved / filtered.length) * 100);

    return (
        <div className="dsa-section">
            {/* section header */}
            <button onClick={() => setCollapsed(v => !v)} className="dsa-section-header">
                <span className="dsa-section-icon" style={{ background: `${category.color}15`, border: `1.5px solid ${category.color}25` }}>
                    {category.emoji}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base" style={{ color: "var(--foreground)" }}>{category.name}</span>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                            style={{ background: `${category.color}15`, color: category.color }}>{filtered.length}</span>
                        {solved > 0 && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>✓ {solved}</span>}
                        {review > 0 && <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>★ {review}</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-60" style={{ background: "var(--muted)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${category.color}, ${category.color}cc)` }} />
                        </div>
                        <span className="text-xs font-black" style={{ color: category.color }}>{pct}%</span>
                    </div>
                </div>
                <span style={{ color: "var(--muted-foreground)", flexShrink: 0 }}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>

            {/* question list */}
            {!collapsed && (
                <div className="border-t" style={{ borderColor: "var(--border)" }}>
                    {filtered.map((q, i) => (
                        <QuestionCard key={q.id} q={q} status={progress[q.id] || "unsolved"}
                            onStatusChange={onStatusChange} index={globalIndex + i + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Stats Sidebar ────────────────────────────────────────────── */
function StatsBar({ progress }: { progress: Progress }) {
    const total = totalQuestions();
    const solved = Object.values(progress).filter(v => v === "solved").length;
    const review = Object.values(progress).filter(v => v === "review").length;
    const unsolved = total - solved - review;
    const pct = Math.round((solved / total) * 100);

    return (
        <div className="dsa-stats-panel sticky top-6 space-y-5">
            {/* overall */}
            <div className="dsa-stats-hero">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "rgba(94,196,168,0.15)" }}>
                            <Trophy size={22} style={{ color: "#5ec4a8" }} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Progress</p>
                            <p className="text-2xl font-black">{solved}<span className="text-sm font-normal" style={{ color: "var(--muted-foreground)" }}> / {total}</span></p>
                        </div>
                    </div>
                    <p className="text-5xl font-black" style={{ color: pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "var(--primary)" }}>{pct}%</p>
                </div>
                {/* ring progress bar */}
                <div className="mt-4 h-2.5 rounded-full overflow-hidden flex gap-0.5" style={{ background: "var(--muted)" }}>
                    {solved > 0 && <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(solved / total) * 100}%`, background: "linear-gradient(90deg,#16614f,#22c55e)" }} />}
                    {review > 0 && <div className="h-full transition-all duration-700" style={{ width: `${(review / total) * 100}%`, background: "linear-gradient(90deg,#b45309,#f59e0b)" }} />}
                </div>
                {/* pills */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {[
                        { l: "Solved", v: solved, c: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                        { l: "Review", v: review, c: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                        { l: "Pending", v: unsolved, c: "var(--muted-foreground)", bg: "var(--muted)" },
                        { l: "Total", v: total, c: "var(--primary)", bg: "rgba(94,196,168,0.1)" },
                    ].map(s => (
                        <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                            <p className="text-xl font-black" style={{ color: s.c }}>{s.v}</p>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.l}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* category breakdown */}
            <div className="rounded-2xl border p-4 space-y-2.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <p className="text-xs font-black uppercase tracking-widest pb-1" style={{ color: "var(--muted-foreground)" }}>By Category</p>
                {DSA_CATEGORIES.map(cat => {
                    const cs = cat.questions.filter(q => progress[q.id] === "solved").length;
                    const cp = Math.round((cs / cat.questions.length) * 100);
                    return (
                        <div key={cat.id} className="flex items-center gap-2.5">
                            <span className="text-sm w-5 text-center shrink-0">{cat.emoji}</span>
                            <span className="text-xs flex-1 truncate font-medium" style={{ color: "var(--foreground)" }}>{cat.name}</span>
                            <div className="w-16 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "var(--muted)" }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cp}%`, background: cat.color }} />
                            </div>
                            <span className="text-xs font-black w-9 text-right shrink-0" style={{ color: cp === 100 ? "#22c55e" : cat.color }}>{cs}/{cat.questions.length}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Category Nav ─────────────────────────────────────────────── */
function CategoryNav({ active, onClick }: { active: string; onClick: (id: string) => void }) {
    return (
        <div className="rounded-2xl border p-3 space-y-0.5 sticky top-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-xs font-black uppercase tracking-widest px-2 pb-2" style={{ color: "var(--muted-foreground)" }}>Jump to</p>
            {DSA_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => onClick(cat.id)}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all"
                    style={{
                        background: active === cat.id ? `${cat.color}15` : "transparent",
                        color: active === cat.id ? cat.color : "var(--muted-foreground)",
                        border: active === cat.id ? `1px solid ${cat.color}25` : "1px solid transparent",
                    }}>
                    <span>{cat.emoji}</span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className="opacity-50 text-xs">{cat.questions.length}</span>
                </button>
            ))}
        </div>
    );
}

/* ─── Reset Modal ──────────────────────────────────────────────── */
function ResetModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
            <div className="rounded-3xl p-8 text-center max-w-sm w-full mx-4" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", animation: "toastIn .3s cubic-bezier(.34,1.56,.64,1)" }} onClick={e => e.stopPropagation()}>
                <div className="flex size-16 items-center justify-center rounded-2xl mx-auto mb-5" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <RotateCcw size={28} style={{ color: "#ef4444" }} />
                </div>
                <h3 className="text-xl font-black">Reset All Progress?</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>All solved and review marks will be cleared. This cannot be undone.</p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="flex-1 rounded-2xl py-3 text-sm font-bold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 rounded-2xl py-3 text-sm font-black" style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>Reset</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ───────────────────────────────────────────── */
export function DSARevision() {
    const [progress, setProgress] = useState<Progress>({});
    const [hydrated, setHydrated] = useState(false);
    const [search, setSearch] = useState("");
    const [filterDiff, setFilterDiff] = useState<Difficulty | "All">("All");
    const [filterStatus, setFilterStatus] = useState<"All" | "solved" | "review" | "unsolved">("All");
    const [activeCategory, setActiveCategory] = useState(DSA_CATEGORIES[0].id);
    const [showReset, setShowReset] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState<ToastData>(null);
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => { setProgress(loadProgress()); setHydrated(true); }, []);

    const handleStatusChange = useCallback((id: string, status: "solved" | "review" | "unsolved", title: string) => {
        setProgress(prev => {
            const next = { ...prev, [id]: status };
            if (status === "unsolved") delete next[id];
            saveProgress(next);
            return next;
        });
        // Fire toast
        if (status === "solved") {
            setToast({ title: "Problem Solved! 🎉", subtitle: title, icon: <CheckCircle2 size={22} style={{ color: "#22c55e" }} />, color: "#22c55e", bg: "rgba(34,197,94,0.15)" });
        } else if (status === "review") {
            setToast({ title: "Marked for Review ⭐", subtitle: title, icon: <Star size={22} style={{ color: "#f59e0b" }} />, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" });
        } else {
            setToast({ title: "Unmarked", subtitle: title, icon: <RotateCcw size={22} style={{ color: "var(--muted-foreground)" }} />, color: "var(--muted-foreground)", bg: "var(--muted)" });
        }
    }, []);

    function handleReset() { setProgress({}); saveProgress({}); setShowReset(false); setToast({ title: "Progress Reset", subtitle: "Start fresh — you got this!", icon: <RotateCcw size={22} style={{ color: "#ef4444" }} />, color: "#ef4444", bg: "rgba(239,68,68,0.12)" }); }

    function scrollToCategory(id: string) {
        setActiveCategory(id);
        categoryRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const categoryStartIndex = useMemo(() => {
        const map: Record<string, number> = {};
        let idx = 0;
        for (const cat of DSA_CATEGORIES) { map[cat.id] = idx; idx += cat.questions.length; }
        return map;
    }, []);

    const activeFilters = (filterDiff !== "All" ? 1 : 0) + (filterStatus !== "All" ? 1 : 0);

    if (!hydrated) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />)}
        </div>
    );

    return (
        <>
            <Toast data={toast} onDone={() => setToast(null)} />
            {showReset && <ResetModal onConfirm={handleReset} onCancel={() => setShowReset(false)} />}

            <div className="space-y-5">
                {/* ── Search + Filter bar ── */}
                <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-48">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search problems or tricks…"
                                className="w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm outline-none"
                                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}><X size={14} /></button>}
                        </div>
                        <button onClick={() => setShowFilters(v => !v)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
                            style={{ background: activeFilters > 0 ? "var(--primary)" : "var(--muted)", color: activeFilters > 0 ? "var(--primary-foreground)" : "var(--foreground)" }}>
                            <Filter size={14} /> Filters
                            {activeFilters > 0 && <span className="flex size-5 items-center justify-center rounded-full text-xs font-black" style={{ background: "rgba(255,255,255,0.25)" }}>{activeFilters}</span>}
                        </button>
                        <button onClick={() => setShowReset(true)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
                            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                            <RotateCcw size={14} /> Reset
                        </button>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>Difficulty:</span>
                                {(["All", "Easy", "Medium", "Hard"] as const).map(d => (
                                    <button key={d} onClick={() => setFilterDiff(d)}
                                        className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
                                        style={{
                                            background: filterDiff === d ? (d === "All" ? "var(--primary)" : DIFF_BG[d as Difficulty]) : "var(--muted)",
                                            color: filterDiff === d ? (d === "All" ? "var(--primary-foreground)" : DIFF_COLOR[d as Difficulty]) : "var(--muted-foreground)",
                                            border: filterDiff === d && d !== "All" ? `1.5px solid ${DIFF_COLOR[d as Difficulty]}50` : "1.5px solid transparent",
                                        }}>{d}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>Status:</span>
                                {(["All", "solved", "review", "unsolved"] as const).map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s)}
                                        className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all capitalize"
                                        style={{ background: filterStatus === s ? "var(--primary)" : "var(--muted)", color: filterStatus === s ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                                        {s === "solved" ? "✓ Solved" : s === "review" ? "★ Review" : s === "unsolved" ? "○ Unsolved" : "All"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 3-col layout ── */}
                <div className="grid gap-5 xl:grid-cols-[210px_1fr_300px]">
                    <div className="hidden xl:block"><CategoryNav active={activeCategory} onClick={scrollToCategory} /></div>

                    <div className="space-y-4 min-w-0">
                        {DSA_CATEGORIES.map(cat => (
                            <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el; }}>
                                <CategorySection category={cat} progress={progress} onStatusChange={handleStatusChange}
                                    searchQuery={search} filterDiff={filterDiff} filterStatus={filterStatus}
                                    globalIndex={categoryStartIndex[cat.id] ?? 0} />
                            </div>
                        ))}
                        {DSA_CATEGORIES.every(cat => cat.questions.filter(q => {
                            const ms = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.trick.toLowerCase().includes(search.toLowerCase());
                            return ms && (filterDiff === "All" || q.difficulty === filterDiff) && (filterStatus === "All" || (progress[q.id] || "unsolved") === filterStatus);
                        }).length === 0) && (
                                <div className="flex flex-col items-center gap-3 rounded-2xl border py-16 text-center"
                                    style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                                    <Search size={36} style={{ color: "var(--muted-foreground)" }} />
                                    <p className="font-bold">No problems match</p>
                                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Try a different search or clear filters.</p>
                                    <button onClick={() => { setSearch(""); setFilterDiff("All"); setFilterStatus("All"); }}
                                        className="mt-1 rounded-xl px-5 py-2.5 text-sm font-bold"
                                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Clear Filters</button>
                                </div>
                            )}
                    </div>

                    <div className="hidden xl:block"><StatsBar progress={progress} /></div>
                </div>

                <div className="xl:hidden"><StatsBar progress={progress} /></div>
            </div>

            <style>{`
        /* ── Card ── */
        .dsa-card {
          position: relative;
          background: var(--card);
          border: 1px solid var(--border);
          transition: box-shadow .2s, border-color .2s;
          overflow: hidden;
        }
        .dsa-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .dsa-card-strip {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; border-radius: 0 2px 2px 0;
        }
        .dsa-card-header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; cursor: pointer; user-select: none;
        }
        .dsa-card-header:hover { background: rgba(0,0,0,0.02); }
        .dark .dsa-card-header:hover { background: rgba(255,255,255,0.02); }
        .dsa-card-body {
          border-top: 1px solid var(--border);
          padding: 16px; display: flex; flex-direction: column; gap: 14px;
        }
        .dsa-num {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 8px;
          font-size: 11px; font-weight: 800; flex-shrink: 0;
        }
        .dsa-badge {
          font-size: 11px; border-radius: 8px; padding: 3px 8px;
          background: var(--muted); color: var(--muted-foreground); font-weight: 600;
        }
        .dsa-lc-btn {
          display: flex; align-items: center; gap: 5px;
          border-radius: 10px; padding: 6px 10px;
          font-size: 11px; font-weight: 800;
          background: rgba(245,158,11,0.1); color: #f59e0b;
          border: 1.5px solid rgba(245,158,11,0.2);
          transition: all .15s; text-decoration: none; flex-shrink: 0;
        }
        .dsa-lc-btn:hover { background: rgba(245,158,11,0.2); transform: scale(1.05); }
        .dsa-mark-btn {
          display: flex; align-items: center; gap: 5px;
          border-radius: 10px; padding: 6px 12px;
          font-size: 11px; font-weight: 800;
          transition: all .2s; min-width: 76px; justify-content: center;
          border: none; cursor: pointer;
        }
        .dsa-mark-btn:hover { opacity: .88; transform: scale(1.03); }
        .dsa-insight-card {
          border-radius: 14px; padding: 14px;
          background: var(--ins-bg); border: 1px solid color-mix(in srgb, var(--ins-color) 20%, transparent);
          display: flex; flex-direction: column; gap: 8px;
        }
        .dsa-insight-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .07em; color: var(--ins-color);
        }

        /* ── Section ── */
        .dsa-section {
          border-radius: 20px; border: 1px solid var(--border);
          background: var(--card); overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .dsa-section-header {
          width: 100%; display: flex; align-items: center;
          gap: 14px; padding: 18px 20px; text-align: left;
          background: transparent; border: none; cursor: pointer;
          transition: background .15s;
        }
        .dsa-section-header:hover { background: color-mix(in srgb, var(--muted) 40%, transparent); }
        .dsa-section-icon {
          display: flex; align-items: center; justify-content: center;
          width: 42px; height: 42px; border-radius: 12px;
          font-size: 18px; flex-shrink: 0;
        }

        /* ── Stats ── */
        .dsa-stats-panel {}
        .dsa-stats-hero {
          border-radius: 20px; border: 1px solid var(--border);
          background: var(--card); padding: 20px;
        }

        /* ── Animations ── */
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
        }
        @keyframes toastBar {
          from { height: 100%; }
          to   { height: 0%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </>
    );
}
