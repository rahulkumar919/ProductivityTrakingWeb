"use client";

import {
    BookOpen, ChevronLeft, ChevronRight, Edit3,
    ImagePlus, Loader2, Plus, Search, Trash2, Upload, X, ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
type Page = {
    _id?: string;
    pageNumber: number;
    cloudinaryId: string;
    imageUrl: string;
    caption: string;
};
type Notebook = {
    _id: string;
    title: string;
    subject: string;
    description: string;
    color: string;
    emoji: string;
    pages: Page[];
    updatedAt: string;
};

/* ─── Constants ──────────────────────────────────────────────────── */
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316", "#0ea5e9", "#a3e635"];
const EMOJIS = ["📓", "📒", "📔", "📕", "📗", "📘", "📙", "📚", "🗒️", "✏️", "🧠", "💡", "🔥", "⚡", "🎯", "🌳", "🕸️", "🔍", "📐", "🧮"];
const SUBJECTS = ["DSA", "Trees", "Graphs", "DP", "Arrays", "Strings", "Two Pointer", "Sliding Window", "Binary Search", "Stack", "Queue", "Heap", "Greedy", "Backtracking", "System Design", "Math", "OS", "DBMS", "Networks", "Other"];

/* ─── File to base64 ─────────────────────────────────────────────── */
function fileToBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

/* ─── Lightbox ───────────────────────────────────────────────────── */
function Lightbox({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.95)" }} onClick={onClose}>
            <button onClick={onClose} className="absolute top-5 right-5 rounded-full p-2.5"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                <X size={20} />
            </button>
            <img src={src} alt={caption}
                className="max-h-[88vh] max-w-[95vw] rounded-2xl object-contain"
                style={{ boxShadow: "0 12px 60px rgba(0,0,0,0.8)", animation: "nvFade .25s ease" }}
                onClick={e => e.stopPropagation()} />
            {caption && (
                <p className="mt-4 text-sm font-medium px-4 text-center"
                    style={{ color: "rgba(255,255,255,0.6)" }}>{caption}</p>
            )}
        </div>
    );
}

/* ─── Book Reader (full screen slideshow) ───────────────────────── */
interface BookReaderProps {
    notebook: Notebook;
    startPage?: number;
    onClose: () => void;
    onDeletePage: (cloudinaryId: string) => Promise<void>;
}
function BookReader({ notebook, startPage = 0, onClose, onDeletePage }: BookReaderProps) {
    const [idx, setIdx] = useState(startPage);
    const [deleting, setDeleting] = useState(false);
    const [lightbox, setLightbox] = useState(false);
    const pages = notebook.pages;
    const page = pages[idx];

    const go = useCallback((dir: 1 | -1) => {
        setIdx(p => Math.max(0, Math.min(pages.length - 1, p + dir)));
    }, [pages.length]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !lightbox) onClose();
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [go, onClose, lightbox]);

    async function handleDelete() {
        if (!page || !confirm(`Delete page ${page.pageNumber}?`)) return;
        setDeleting(true);
        await onDeletePage(page.cloudinaryId);
        setIdx(i => Math.max(0, i - 1));
        setDeleting(false);
    }

    if (!page) return null;
    const pct = Math.round(((idx + 1) / pages.length) * 100);

    return (
        <>
            {lightbox && <Lightbox src={page.imageUrl} caption={page.caption} onClose={() => setLightbox(false)} />}
            <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#08100d" }}>

                {/* ── Top Bar ── */}
                <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0d1610" }}>
                    <div className="flex size-9 items-center justify-center rounded-xl shrink-0"
                        style={{ background: `${notebook.color}20` }}>
                        <span className="text-lg">{notebook.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-white truncate">{notebook.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {notebook.subject} · {pages.length} pages
                        </p>
                    </div>

                    {/* page counter input */}
                    <div className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                        style={{ background: "rgba(255,255,255,0.07)" }}>
                        <button onClick={() => go(-1)} disabled={idx === 0}
                            className="disabled:opacity-30 transition-opacity" style={{ color: "#fff" }}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-black text-white">{idx + 1}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/ {pages.length}</span>
                        <button onClick={() => go(1)} disabled={idx === pages.length - 1}
                            className="disabled:opacity-30 transition-opacity" style={{ color: "#fff" }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button onClick={() => setLightbox(true)} title="Full screen"
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                        style={{ color: "rgba(255,255,255,0.7)" }}>
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleDelete} disabled={deleting} title="Delete this page"
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-40"
                        style={{ color: "#ef4444" }}>
                        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                    <button onClick={onClose} className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                        style={{ color: "#fff" }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Main image ── */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-4"
                    style={{ background: "#111a14" }}>
                    <div className="relative w-full max-w-3xl">
                        <img
                            key={idx}
                            src={page.imageUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full rounded-2xl object-contain cursor-zoom-in"
                            style={{
                                maxHeight: "76vh", background: "#fff",
                                boxShadow: "0 16px 64px rgba(0,0,0,0.5)",
                                animation: "nvFade .2s ease",
                            }}
                            onClick={() => setLightbox(true)}
                        />
                        {/* page number badge */}
                        <div className="absolute top-3 left-3 rounded-xl px-3 py-1.5 text-xs font-black"
                            style={{ background: `${notebook.color}cc`, color: "#fff" }}>
                            Page {page.pageNumber}
                        </div>
                        {/* nav arrows over image */}
                        {idx > 0 && (
                            <button onClick={() => go(-1)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-3 hover:scale-110 transition-all"
                                style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                                <ChevronLeft size={22} />
                            </button>
                        )}
                        {idx < pages.length - 1 && (
                            <button onClick={() => go(1)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-3 hover:scale-110 transition-all"
                                style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                                <ChevronRight size={22} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3 border-t shrink-0 space-y-2"
                    style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0d1610" }}>
                    {page.caption && (
                        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{page.caption}</p>
                    )}
                    {/* progress bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: notebook.color }} />
                        </div>
                        <span className="text-xs font-bold shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {pct}% · ← → navigate · Esc close
                        </span>
                    </div>
                    {/* page thumbnails strip */}
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        {pages.map((p, i) => (
                            <button key={i} onClick={() => setIdx(i)}
                                className="rounded-xl overflow-hidden shrink-0 transition-all"
                                style={{
                                    width: 52, height: 52,
                                    border: `2px solid ${i === idx ? notebook.color : "transparent"}`,
                                    opacity: i === idx ? 1 : 0.5,
                                    transform: i === idx ? "scale(1.08)" : "scale(1)",
                                }}>
                                <img src={p.imageUrl} alt={`P${p.pageNumber}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Create Notebook Modal ─────────────────────────────────────── */
interface CreateModalProps {
    onSave: (data: { title: string; subject: string; description: string; color: string; emoji: string }) => Promise<void>;
    onClose: () => void;
}
function CreateModal({ onSave, onClose }: CreateModalProps) {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("DSA");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [emoji, setEmoji] = useState(EMOJIS[0]);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (!title.trim()) return;
        setSaving(true);
        await onSave({ title: title.trim(), subject, description, color, emoji });
        setSaving(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} onClick={onClose}>
            <div className="rounded-3xl p-7 max-w-lg w-full mx-4 space-y-5"
                style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "nvFade .3s ease", maxHeight: "90vh", overflowY: "auto" }}
                onClick={e => e.stopPropagation()}>

                {/* Preview header */}
                <div className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: `${color}12`, border: `2px solid ${color}30` }}>
                    <div className="flex size-14 items-center justify-center rounded-2xl text-3xl shrink-0"
                        style={{ background: `${color}20` }}>{emoji}</div>
                    <div>
                        <p className="font-black text-base" style={{ color: "var(--foreground)" }}>{title || "Notebook Title"}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{subject}</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Title *</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Tree Notes, Graph Algorithms, Sliding Window…"
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-primary"
                            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Description (optional)</label>
                        <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="What's in this notebook?"
                            className="w-full rounded-2xl border px-4 py-3 text-sm resize-none outline-none"
                            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    </div>

                    {/* Emoji picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Emoji</label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJIS.map(e => (
                                <button key={e} onClick={() => setEmoji(e)} type="button"
                                    className="text-xl rounded-xl p-2 transition-all"
                                    style={{ background: emoji === e ? `${color}25` : "var(--muted)", border: `2px solid ${emoji === e ? color : "transparent"}` }}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button key={c} onClick={() => setColor(c)} type="button"
                                    className="size-8 rounded-full transition-all hover:scale-110"
                                    style={{ background: c, border: `3px solid ${color === c ? "var(--foreground)" : "transparent"}`, boxShadow: color === c ? `0 0 0 2px var(--card), 0 0 0 4px ${c}` : "none" }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-bold"
                        style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                    <button onClick={handleSave} disabled={!title.trim() || saving}
                        className="flex-1 rounded-2xl py-3 text-sm font-black disabled:opacity-50 transition-all"
                        style={{ background: `linear-gradient(135deg,${color}dd,${color})`, color: "#fff" }}>
                        {saving ? "Creating…" : "Create Notebook"}
                    </button>
                </div>
            </div>
        </div>
    );
}
