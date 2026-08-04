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

/* ─── NotesVault (main exported component) ──────────────────────── */
export function NotesVault() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("All");
    const [showCreate, setShowCreate] = useState(false);
    const [reader, setReader] = useState<{ notebook: Notebook; startPage?: number } | null>(null);
    const [uploadTarget, setUploadTarget] = useState<Notebook | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Notebook | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Fetch ── */
    useEffect(() => {
        fetch("/api/notebooks")
            .then(r => r.ok ? r.json() : [])
            .then(data => setNotebooks(Array.isArray(data) ? data : []))
            .catch(() => setNotebooks([]))
            .finally(() => setLoading(false));
    }, []);

    /* ── Create notebook ── */
    async function handleCreate(data: { title: string; subject: string; description: string; color: string; emoji: string }) {
        const res = await fetch("/api/notebooks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const nb: Notebook = await res.json();
            setNotebooks(prev => [nb, ...prev]);
            setShowCreate(false);
        }
    }

    /* ── Upload pages ── */
    async function handleUploadFiles(files: FileList | null) {
        if (!files || !uploadTarget) return;
        setUploading(true);
        try {
            const b64s = await Promise.all(Array.from(files).map(fileToBase64));
            const res = await fetch(`/api/notebooks/${uploadTarget._id}/pages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ images: b64s }),
            });
            if (res.ok) {
                const updated: Notebook = await res.json();
                setNotebooks(prev => prev.map(nb => nb._id === updated._id ? updated : nb));
                setUploadTarget(updated);
            }
        } finally {
            setUploading(false);
        }
    }

    /* ── Delete page ── */
    async function handleDeletePage(notebookId: string, cloudinaryId: string) {
        const res = await fetch(`/api/notebooks/${notebookId}/pages?cloudinaryId=${encodeURIComponent(cloudinaryId)}`, {
            method: "DELETE",
        });
        if (res.ok) {
            const updated: Notebook = await res.json();
            setNotebooks(prev => prev.map(nb => nb._id === updated._id ? updated : nb));
            // sync open reader
            setReader(prev => prev?.notebook._id === updated._id ? { ...prev, notebook: updated } : prev);
        }
    }

    /* ── Delete notebook ── */
    async function handleDeleteNotebook() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await fetch(`/api/notebooks/${deleteTarget._id}`, { method: "DELETE" });
            setNotebooks(prev => prev.filter(nb => nb._id !== deleteTarget._id));
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

    /* ── Derived ── */
    const allSubjects = ["All", ...Array.from(new Set(notebooks.map(nb => nb.subject)))];
    const filtered = notebooks.filter(nb => {
        const matchSearch = !search || nb.title.toLowerCase().includes(search.toLowerCase()) || nb.subject.toLowerCase().includes(search.toLowerCase());
        const matchSubject = subjectFilter === "All" || nb.subject === subjectFilter;
        return matchSearch && matchSubject;
    });
    const totalPages = notebooks.reduce((s, nb) => s + nb.pages.length, 0);

    return (
        <>
            {/* Create modal */}
            {showCreate && <CreateModal onSave={handleCreate} onClose={() => setShowCreate(false)} />}

            {/* Book reader */}
            {reader && (
                <BookReader
                    notebook={reader.notebook}
                    startPage={reader.startPage}
                    onClose={() => setReader(null)}
                    onDeletePage={(cid) => handleDeletePage(reader.notebook._id, cid)}
                />
            )}

            {/* Upload panel */}
            {uploadTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
                    onClick={() => setUploadTarget(null)}>
                    <div className="rounded-3xl p-7 max-w-sm w-full mx-4 space-y-5"
                        style={{ background: "var(--card)", border: "1px solid var(--border)", animation: "nvFade .3s ease" }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{uploadTarget.emoji}</span>
                            <div>
                                <p className="font-black text-base" style={{ color: "var(--foreground)" }}>{uploadTarget.title}</p>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{uploadTarget.pages.length} pages</p>
                            </div>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full rounded-2xl border-2 border-dashed py-8 flex flex-col items-center gap-3 transition-all hover:scale-[1.01]"
                            style={{ borderColor: uploadTarget.color, background: `${uploadTarget.color}08`, color: uploadTarget.color }}>
                            {uploading
                                ? <Loader2 size={28} className="animate-spin" />
                                : <ImagePlus size={28} />}
                            <span className="text-sm font-black">
                                {uploading ? "Uploading…" : "Tap to add pages (JPG/PNG/WEBP)"}
                            </span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => handleUploadFiles(e.target.files)}
                        />

                        {uploadTarget.pages.length > 0 && (
                            <button
                                onClick={() => { setReader({ notebook: uploadTarget }); setUploadTarget(null); }}
                                className="w-full rounded-2xl py-3 text-sm font-black flex items-center justify-center gap-2"
                                style={{ background: `linear-gradient(135deg,${uploadTarget.color}cc,${uploadTarget.color})`, color: "#fff" }}>
                                <BookOpen size={15} /> Open Notebook
                            </button>
                        )}

                        <button onClick={() => setUploadTarget(null)}
                            className="w-full rounded-2xl py-3 text-sm font-bold"
                            style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                    onClick={() => setDeleteTarget(null)}>
                    <div className="rounded-3xl p-8 text-center max-w-sm w-full mx-4"
                        style={{ background: "var(--card)", border: "1px solid var(--border)", animation: "nvFade .25s ease" }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex size-16 items-center justify-center rounded-2xl mx-auto mb-4"
                            style={{ background: "rgba(239,68,68,0.1)" }}>
                            <Trash2 size={28} style={{ color: "#ef4444" }} />
                        </div>
                        <h3 className="text-lg font-black">Delete Notebook?</h3>
                        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            &ldquo;{deleteTarget.title}&rdquo; and all its pages will be permanently deleted.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 rounded-2xl py-3 text-sm font-bold"
                                style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                            <button onClick={handleDeleteNotebook} disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black"
                                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>
                                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: "Notebooks", value: notebooks.length, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
                        { label: "Total Pages", value: totalPages, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                        { label: "Subjects", value: allSubjects.length - 1, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                <BookOpen size={18} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-52 rounded-2xl border px-3 py-2.5"
                        style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                        <Search size={15} style={{ color: "var(--muted-foreground)" }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search notebooks…" className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--foreground)" }} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {allSubjects.map(s => (
                            <button key={s} onClick={() => setSubjectFilter(s)}
                                className="rounded-xl px-3 py-2 text-xs font-bold transition-all"
                                style={{
                                    background: subjectFilter === s ? "var(--primary)" : "var(--muted)",
                                    color: subjectFilter === s ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                    border: `1px solid ${subjectFilter === s ? "var(--primary)" : "var(--border)"}`,
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                        <Plus size={16} /> New Notebook
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex size-20 items-center justify-center rounded-3xl"
                            style={{ background: "rgba(99,102,241,0.08)" }}>
                            <BookOpen size={36} style={{ color: "#6366f1" }} />
                        </div>
                        <div>
                            <p className="font-black text-lg" style={{ color: "var(--foreground)" }}>
                                {notebooks.length === 0 ? "No notebooks yet" : "No results found"}
                            </p>
                            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                                {notebooks.length === 0
                                    ? "Create a notebook for each topic and upload your handwritten notes."
                                    : "Try a different search or subject filter."}
                            </p>
                        </div>
                        {notebooks.length === 0 && (
                            <button onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black"
                                style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff" }}>
                                <Plus size={15} /> Create First Notebook
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(nb => (
                            <div key={nb._id} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                                {/* Color strip */}
                                <div style={{ height: 4, background: nb.color }} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-2xl shrink-0 text-2xl"
                                            style={{ background: `${nb.color}18` }}>
                                            {nb.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate" style={{ color: "var(--foreground)" }}>{nb.title}</p>
                                            <p className="text-xs mt-0.5 font-semibold" style={{ color: nb.color }}>{nb.subject}</p>
                                        </div>
                                    </div>

                                    {nb.description && (
                                        <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{nb.description}</p>
                                    )}

                                    {/* Page thumbnails */}
                                    {nb.pages.length > 0 ? (
                                        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                            {nb.pages.slice(0, 6).map((p, i) => (
                                                <button key={i}
                                                    onClick={() => setReader({ notebook: nb, startPage: i })}
                                                    className="rounded-xl overflow-hidden shrink-0 hover:scale-105 transition-all"
                                                    style={{ width: 52, height: 52, border: `2px solid ${nb.color}30` }}>
                                                    <img src={p.imageUrl} alt={`P${p.pageNumber}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                            {nb.pages.length > 6 && (
                                                <div className="flex items-center justify-center rounded-xl shrink-0 text-xs font-black"
                                                    style={{ width: 52, height: 52, background: `${nb.color}15`, color: nb.color }}>
                                                    +{nb.pages.length - 6}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl py-5 text-center"
                                            style={{ background: `${nb.color}08`, border: `1.5px dashed ${nb.color}40` }}>
                                            <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>No pages yet</p>
                                        </div>
                                    )}

                                    {/* Page count */}
                                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                        {nb.pages.length} {nb.pages.length === 1 ? "page" : "pages"}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => setUploadTarget(nb)}
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all hover:scale-[1.02]"
                                            style={{ background: `${nb.color}18`, color: nb.color }}>
                                            <Upload size={13} /> Add Pages
                                        </button>
                                        {nb.pages.length > 0 && (
                                            <button onClick={() => setReader({ notebook: nb })}
                                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all hover:scale-[1.02]"
                                                style={{ background: `linear-gradient(135deg,${nb.color}cc,${nb.color})`, color: "#fff" }}>
                                                <BookOpen size={13} /> Read
                                            </button>
                                        )}
                                        <button onClick={() => setDeleteTarget(nb)}
                                            className="flex size-9 items-center justify-center rounded-xl transition-all hover:scale-105"
                                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes nvFade { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
        </>
    );
}
