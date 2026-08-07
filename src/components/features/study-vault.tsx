"use client";

import {
    BookMarked, BookOpen, ChevronLeft, ChevronRight,
    FileText, Loader2, Maximize2, Minimize2, Plus,
    Search, StickyNote, Trash2, Upload, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ─────────────────────────────────────────────────────── */
type PDFNote = { id: string; page: number; text: string; createdAt: string };

type PDFDoc = {
    _id: string;
    title: string;
    category: string;
    pdfUrl: string;
    fileSize: number;
    totalPages: number;
    lastPage: number;
    color: string;
    notes: PDFNote[];
    createdAt: string;
};

const CATEGORIES = [
    "General", "DSA", "System Design", "DBMS", "OS",
    "Networking", "OOP", "Mathematics", "Aptitude", "Other",
];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

/* ─── Local PDF cache (base64) ───────────────────────────────────── */
// We store base64 in localStorage keyed by DB _id so the viewer works offline
// without any CORS/Cloudinary issues — exactly like the original flow.
function getCachedPdf(id: string): string | null {
    try { return localStorage.getItem(`sv_pdf_${id}`); } catch { return null; }
}
function setCachedPdf(id: string, base64: string) {
    try { localStorage.setItem(`sv_pdf_${id}`, base64); } catch { /* storage full */ }
}
function removeCachedPdf(id: string) {
    try { localStorage.removeItem(`sv_pdf_${id}`); } catch { /* ignore */ }
}

function fmtSize(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fileToBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

/* ─── Upload Modal ───────────────────────────────────────────────── */
function UploadModal({ onClose, onUploaded }: {
    onClose: () => void;
    onUploaded: (pdf: PDFDoc) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    function pickFile(f: File) {
        if (f.type !== "application/pdf") { setError("Only PDF files are allowed."); return; }
        if (f.size > 20 * 1024 * 1024) { setError("PDF must be under 20 MB."); return; }
        setFile(f);
        if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) { setError("Please select a PDF file."); return; }
        if (!title.trim()) { setError("Please enter a title."); return; }
        setUploading(true); setError("");
        try {
            const data = await fileToBase64(file);
            const res = await fetch("/api/study-pdfs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), category, data, fileSize: file.size, totalPages: 1 }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Upload failed");
            // Cache base64 locally so viewer works immediately
            setCachedPdf(json._id, data);
            onUploaded(json);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Try again.");
        } finally { setUploading(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={onClose}>
            <div className="rounded-3xl p-7 max-w-md w-full mx-4"
                style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "svFade .25s ease" }}
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>Upload PDF</h2>
                        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Save permanently to your vault</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted transition-colors">
                        <X size={18} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
                        onClick={() => inputRef.current?.click()}
                        className="sv-drop"
                        style={{ borderColor: file ? "var(--primary)" : dragging ? "var(--primary)" : "var(--border)", background: file ? "rgba(22,97,79,0.06)" : dragging ? "rgba(22,97,79,0.04)" : "var(--muted)" }}
                    >
                        <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                        {file ? (
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "rgba(22,97,79,0.12)" }}>
                                    <FileText size={22} style={{ color: "var(--primary)" }} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{file.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{fmtSize(file.size)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="flex size-14 items-center justify-center rounded-2xl mx-auto mb-3" style={{ background: "rgba(22,97,79,0.08)" }}>
                                    <Upload size={24} style={{ color: "var(--primary)" }} />
                                </div>
                                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{dragging ? "Drop it here!" : "Click or drag & drop"}</p>
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>PDF only · Max 20 MB</p>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="sv-field">
                        <label className="sv-label">Title *</label>
                        <input className="sv-input" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Sliding Window Notes" required />
                    </div>

                    {/* Category */}
                    <div className="sv-field">
                        <label className="sv-label">Category</label>
                        <select className="sv-input" value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {error && <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-bold"
                            style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                        <button type="submit" disabled={uploading} className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black"
                            style={{ background: uploading ? "var(--muted)" : "linear-gradient(135deg,#16614f,#5ec4a8)", color: uploading ? "var(--muted-foreground)" : "#fff" }}>
                            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : <><Upload size={15} /> Upload & Save</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── PDF Viewer ─────────────────────────────────────────────────── */
function PDFViewer({ doc, onClose, onProgress, onAddNote, onDeleteNote }: {
    doc: PDFDoc;
    onClose: () => void;
    onProgress: (id: string, page: number, totalPages?: number) => void;
    onAddNote: (id: string, note: PDFNote) => void;
    onDeleteNote: (docId: string, noteId: string) => void;
}) {
    const [page, setPage] = useState(doc.lastPage || 1);
    const [zoom, setZoom] = useState(100);
    const [fullscreen, setFullscreen] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [addingNote, setAddingNote] = useState(false);
    const [loading, setLoading] = useState(true);
    const proxyUrl = `/api/study-pdfs/${doc._id}/proxy`;
    const iframeSrc = `${proxyUrl}#page=${page}`;

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !addingNote) onClose();
            if (e.key === "ArrowRight") setPage(p => Math.min(doc.totalPages, p + 1));
            if (e.key === "ArrowLeft") setPage(p => Math.max(1, p - 1));
            if (e.key === "+" || e.key === "=") setZoom(z => Math.min(200, z + 10));
            if (e.key === "-") setZoom(z => Math.max(50, z - 10));
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [doc.totalPages, onClose, addingNote]);

    useEffect(() => { onProgress(doc._id, page); }, [page, doc._id, onProgress]);

    // Reset loading state on page change
    useEffect(() => { setLoading(true); }, [page]);

    const pageNotes = doc.notes.filter(n => n.page === page);
    const pct = Math.round((page / doc.totalPages) * 100);

    function saveNote() {
        if (!noteText.trim()) return;
        const note: PDFNote = { id: crypto.randomUUID(), page, text: noteText.trim(), createdAt: new Date().toISOString() };
        onAddNote(doc._id, note);
        setNoteText(""); setAddingNote(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0a0f0d" }}>
            {/* ── Top Bar ── */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0d1610" }}>
                {/* Title + progress */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex size-8 items-center justify-center rounded-xl shrink-0" style={{ background: `${doc.color}22` }}>
                        <FileText size={15} style={{ color: doc.color }} />
                    </div>
                    <div className="min-w-0 hidden sm:block">
                        <p className="font-black text-sm text-white truncate leading-tight">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: doc.color }} />
                            </div>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{pct}% read</span>
                        </div>
                    </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                        className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                        style={{ color: "#fff" }}>
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm"
                        style={{ background: "rgba(255,255,255,0.08)" }}>
                        <input
                            type="number" min={1} max={doc.totalPages} value={page}
                            onChange={e => {
                                const v = Math.max(1, Math.min(doc.totalPages, Number(e.target.value)));
                                if (!isNaN(v)) setPage(v);
                            }}
                            className="w-9 bg-transparent text-center font-black text-white outline-none"
                            style={{ fontSize: "0.85rem" }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem" }}>/ {doc.totalPages}</span>
                    </div>
                    <button onClick={() => setPage(p => Math.min(doc.totalPages, p + 1))} disabled={page >= doc.totalPages}
                        className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
                        style={{ color: "#fff" }}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Zoom */}
                <div className="hidden md:flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <button onClick={() => setZoom(z => Math.max(50, z - 10))}
                        className="flex size-7 items-center justify-center rounded hover:bg-white/10 transition-all" style={{ color: "#fff" }}>
                        <ZoomOut size={14} />
                    </button>
                    <button onClick={() => setZoom(100)}
                        className="text-xs font-bold w-10 text-center hover:text-white transition-colors"
                        style={{ color: "rgba(255,255,255,0.6)" }}>{zoom}%</button>
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))}
                        className="flex size-7 items-center justify-center rounded hover:bg-white/10 transition-all" style={{ color: "#fff" }}>
                        <ZoomIn size={14} />
                    </button>
                </div>

                {/* Notes toggle */}
                <button onClick={() => setShowNotes(v => !v)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all"
                    style={{
                        background: showNotes ? `${doc.color}22` : "rgba(255,255,255,0.07)",
                        color: showNotes ? doc.color : "rgba(255,255,255,0.7)",
                        border: `1.5px solid ${showNotes ? doc.color + "50" : "transparent"}`,
                    }}>
                    <StickyNote size={13} />
                    <span className="hidden sm:inline">Notes</span>
                    {doc.notes.length > 0 && (
                        <span className="rounded-full px-1.5 py-0.5 text-xs font-black" style={{ background: doc.color, color: "#fff", fontSize: "0.65rem" }}>
                            {doc.notes.length}
                        </span>
                    )}
                </button>

                {/* Fullscreen */}
                <button onClick={() => setFullscreen(v => !v)}
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 transition-all" style={{ color: "#fff" }}>
                    {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                {/* Close */}
                <button onClick={onClose}
                    className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 transition-all" style={{ color: "#fff" }}>
                    <X size={16} />
                </button>
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* PDF Area */}
                <div className="flex-1 relative overflow-auto flex items-start justify-center"
                    style={{ background: "#141a16", padding: fullscreen ? "0" : "1rem" }}>

                    {/* Loading spinner overlay */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10"
                            style={{ background: "rgba(10,15,13,0.85)" }}>
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={36} className="animate-spin" style={{ color: doc.color }} />
                                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Loading PDF…</p>
                            </div>
                        </div>
                    )}

                    {/* The PDF iframe — uses our proxy to bypass Cloudinary CORS */}
                    <div style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top center",
                        transition: "transform 0.15s ease",
                        width: "100%",
                        maxWidth: fullscreen ? "none" : 960,
                    }}>
                        <iframe
                            key={`${doc._id}-${page}`}
                            src={iframeSrc}
                            title={doc.title}
                            onLoad={() => setLoading(false)}
                            style={{
                                width: "100%",
                                height: fullscreen ? "100vh" : "calc(100vh - 130px)",
                                border: "none",
                                borderRadius: fullscreen ? 0 : 12,
                                background: "#fff",
                                display: "block",
                            }}
                        />
                    </div>
                </div>

                {/* ── Notes Sidebar ── */}
                {showNotes && (
                    <div className="w-72 xl:w-80 shrink-0 flex flex-col border-l"
                        style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0d1610" }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <div>
                                <p className="font-black text-sm text-white">Notes</p>
                                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    Page {page} · {pageNotes.length} note{pageNotes.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button onClick={() => setAddingNote(true)} disabled={addingNote}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black disabled:opacity-40 transition-all hover:scale-[1.03]"
                                style={{ background: `${doc.color}22`, color: doc.color }}>
                                <Plus size={12} /> Add
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
                            {/* Note input */}
                            {addingNote && (
                                <div className="rounded-2xl p-3 space-y-2 border"
                                    style={{ background: `${doc.color}0d`, borderColor: `${doc.color}30` }}>
                                    <p className="text-xs font-black" style={{ color: doc.color }}>Note · Page {page}</p>
                                    <textarea
                                        autoFocus rows={4}
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Write your note…"
                                        className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
                                        style={{ background: "rgba(0,0,0,0.35)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", lineHeight: 1.5 }}
                                        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) saveNote(); }}
                                    />
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Ctrl+Enter to save</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setAddingNote(false); setNoteText(""); }}
                                            className="flex-1 rounded-xl py-2 text-xs font-bold"
                                            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}>
                                            Cancel
                                        </button>
                                        <button onClick={saveNote} disabled={!noteText.trim()}
                                            className="flex-1 rounded-xl py-2 text-xs font-black disabled:opacity-40"
                                            style={{ background: doc.color, color: "#fff" }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No notes placeholder */}
                            {pageNotes.length === 0 && !addingNote && (
                                <div className="flex flex-col items-center gap-2 py-12 text-center">
                                    <StickyNote size={26} style={{ color: "rgba(255,255,255,0.12)" }} />
                                    <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>No notes on page {page}</p>
                                    <button onClick={() => setAddingNote(true)}
                                        className="text-xs font-black mt-1 rounded-xl px-3 py-1.5"
                                        style={{ color: doc.color, background: `${doc.color}15` }}>
                                        + Add a note
                                    </button>
                                </div>
                            )}

                            {/* Note cards */}
                            {pageNotes.map(note => (
                                <div key={note.id} className="group rounded-2xl p-3.5 border"
                                    style={{ background: `${doc.color}0a`, borderColor: `${doc.color}20` }}>
                                    <div className="flex items-start gap-2">
                                        <p className="text-sm text-white leading-relaxed flex-1 whitespace-pre-wrap">{note.text}</p>
                                        <button onClick={() => onDeleteNote(doc._id, note.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 shrink-0 hover:bg-red-500/20"
                                            style={{ color: "#ef4444" }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                                        {new Date(note.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                                    </p>
                                </div>
                            ))}

                            {/* All notes from other pages */}
                            {doc.notes.filter(n => n.page !== page).length > 0 && (
                                <details className="mt-2">
                                    <summary className="text-xs font-bold cursor-pointer select-none py-1"
                                        style={{ color: "rgba(255,255,255,0.3)" }}>
                                        {doc.notes.filter(n => n.page !== page).length} notes from other pages
                                    </summary>
                                    <div className="mt-2 space-y-2">
                                        {doc.notes.filter(n => n.page !== page).map(note => (
                                            <div key={note.id}
                                                className="group rounded-xl p-3 border cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                                                onClick={() => setPage(note.page)}>
                                                <p className="text-xs font-bold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Page {note.page}</p>
                                                <p className="text-xs text-white leading-relaxed line-clamp-2">{note.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Bar ── */}
            <div className="flex items-center gap-4 px-5 py-2 border-t shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0d1610" }}>
                {/* Quick page jump buttons */}
                <div className="hidden md:flex items-center gap-1.5 flex-wrap max-w-xs overflow-hidden">
                    {Array.from({ length: Math.min(doc.totalPages, 12) }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className="rounded-md text-xs font-bold transition-all"
                            style={{
                                width: 26, height: 22,
                                background: p === page ? doc.color : "rgba(255,255,255,0.06)",
                                color: p === page ? "#fff" : "rgba(255,255,255,0.35)",
                                fontSize: "0.68rem",
                            }}>
                            {p}
                        </button>
                    ))}
                    {doc.totalPages > 12 && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>+{doc.totalPages - 12} more</span>
                    )}
                </div>

                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg,${doc.color}88,${doc.color})` }} />
                </div>

                <span className="text-xs font-semibold shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {page} / {doc.totalPages} · ← → navigate · Esc close
                </span>
            </div>
        </div>
    );
}

/* ─── PDF Card ───────────────────────────────────────────────────── */
function PDFCard({ doc, onOpen, onDelete }: { doc: PDFDoc; onOpen: () => void; onDelete: () => void }) {
    const pct = Math.round((doc.lastPage / Math.max(doc.totalPages, 1)) * 100);
    const done = pct >= 100;
    return (
        <div className="sv-card group" style={{ "--c": doc.color } as React.CSSProperties}>
            <div className="sv-card-strip" style={{ background: doc.color }} />
            <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl shrink-0"
                        style={{ background: `${doc.color}15`, border: `1.5px solid ${doc.color}25` }}>
                        <FileText size={22} style={{ color: doc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm leading-tight truncate" style={{ color: "var(--foreground)" }}>{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="rounded-lg px-2 py-0.5 text-xs font-bold"
                                style={{ background: `${doc.color}15`, color: doc.color }}>{doc.category}</span>
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {fmtSize(doc.fileSize)} · Added {fmtDate(doc.createdAt)}
                            </span>
                        </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-2 hover:bg-red-500/10"
                        style={{ color: "#ef4444" }}>
                        <Trash2 size={15} />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                            {done ? "✓ Completed" : `Page ${doc.lastPage} / ${doc.totalPages}`}
                        </span>
                        <span className="text-xs font-black" style={{ color: done ? "#22c55e" : doc.color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: done ? "#22c55e" : `linear-gradient(90deg,${doc.color}99,${doc.color})` }} />
                    </div>
                </div>

                {doc.notes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                            style={{ background: `${doc.color}12`, color: doc.color }}>
                            <StickyNote size={11} /> {doc.notes.length} note{doc.notes.length !== 1 ? "s" : ""}
                        </span>
                        {done && <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>✓ Done</span>}
                    </div>
                )}

                <button onClick={onOpen}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg,${doc.color}dd,${doc.color})`, color: "#fff", boxShadow: `0 4px 16px ${doc.color}35` }}>
                    <BookOpen size={15} />
                    {pct === 0 ? "Start Reading" : done ? "Read Again" : "Continue Reading"}
                </button>
            </div>
        </div>
    );
}

/* ─── Main StudyVault ────────────────────────────────────────────── */
export function StudyVault() {
    const [docs, setDocs] = useState<PDFDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDoc, setOpenDoc] = useState<PDFDoc | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PDFDoc | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");

    // Load from DB on mount
    useEffect(() => {
        fetch("/api/study-pdfs")
            .then(r => r.ok ? r.json() : [])
            .then(data => { setDocs(Array.isArray(data) ? data : []); })
            .catch(() => setDocs([]))
            .finally(() => setLoading(false));
    }, []);

    function handleUploaded(pdf: PDFDoc) {
        setDocs(prev => [pdf, ...prev]);
    }

    const handleProgress = useCallback(async (id: string, page: number) => {
        setDocs(prev => prev.map(d => d._id === id ? { ...d, lastPage: Math.max(d.lastPage, page) } : d));
        setOpenDoc(cur => cur?._id === id ? { ...cur, lastPage: Math.max(cur.lastPage, page) } : cur);
        // Persist to DB (fire-and-forget)
        fetch(`/api/study-pdfs/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastPage: page }),
        }).catch(() => { });
    }, []);

    const handleAddNote = useCallback(async (docId: string, note: PDFNote) => {
        setDocs(prev => prev.map(d => d._id === docId ? { ...d, notes: [...d.notes, note] } : d));
        setOpenDoc(cur => cur?._id === docId ? { ...cur, notes: [...cur.notes, note] } : cur);
        fetch(`/api/study-pdfs/${docId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addNote: note }),
        }).catch(() => { });
    }, []);

    const handleDeleteNote = useCallback(async (docId: string, noteId: string) => {
        setDocs(prev => prev.map(d => d._id === docId ? { ...d, notes: d.notes.filter(n => n.id !== noteId) } : d));
        setOpenDoc(cur => cur?._id === docId ? { ...cur, notes: cur.notes.filter(n => n.id !== noteId) } : cur);
        fetch(`/api/study-pdfs/${docId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deleteNoteId: noteId }),
        }).catch(() => { });
    }, []);

    async function handleDelete(doc: PDFDoc) {
        setDeleting(true);
        try {
            await fetch(`/api/study-pdfs/${doc._id}`, { method: "DELETE" });
            removeCachedPdf(doc._id);
            setDocs(prev => prev.filter(d => d._id !== doc._id));
        } finally { setDeleting(false); setDeleteTarget(null); }
    }

    const allCats = ["All", ...Array.from(new Set(docs.map(d => d.category)))];
    const filtered = docs.filter(d => {
        const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === "All" || d.category === catFilter;
        return matchSearch && matchCat;
    });

    const totalNotes = docs.reduce((s, d) => s + d.notes.length, 0);
    const completed = docs.filter(d => d.lastPage >= d.totalPages && d.totalPages > 1).length;

    return (
        <>
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}

            {openDoc && (
                <PDFViewer doc={openDoc} onClose={() => setOpenDoc(null)}
                    onProgress={handleProgress} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                    onClick={() => setDeleteTarget(null)}>
                    <div className="rounded-3xl p-8 text-center max-w-sm w-full mx-4"
                        style={{ background: "var(--card)", border: "1px solid var(--border)", animation: "svFade .25s ease" }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex size-16 items-center justify-center rounded-2xl mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
                            <Trash2 size={28} style={{ color: "#ef4444" }} />
                        </div>
                        <h3 className="text-lg font-black">Delete PDF?</h3>
                        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            &ldquo;{deleteTarget.title}&rdquo; and all its notes will be permanently deleted from your vault.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-2xl py-3 text-sm font-bold"
                                style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteTarget)} disabled={deleting}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black"
                                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>
                                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total PDFs", value: docs.length, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
                        { label: "Completed", value: completed, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                        { label: "In Progress", value: docs.length - completed, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                        { label: "Total Notes", value: totalNotes, color: "#14b8a6", bg: "rgba(20,184,166,0.1)" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                                <BookMarked size={18} style={{ color: s.color }} />
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
                            placeholder="Search PDFs…" className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--foreground)" }} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {allCats.map(c => (
                            <button key={c} onClick={() => setCatFilter(c)}
                                className="rounded-xl px-3 py-2 text-xs font-bold transition-all"
                                style={{
                                    background: catFilter === c ? "var(--primary)" : "var(--muted)",
                                    color: catFilter === c ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                    border: `1px solid ${catFilter === c ? "var(--primary)" : "var(--border)"}`,
                                }}>
                                {c}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg,#16614f,#5ec4a8)", color: "#fff", boxShadow: "0 4px 16px rgba(22,97,79,0.35)" }}>
                        <Plus size={16} /> Add PDF
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
                            style={{ background: "rgba(22,97,79,0.08)" }}>
                            <BookMarked size={36} style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p className="font-black text-lg" style={{ color: "var(--foreground)" }}>
                                {docs.length === 0 ? "No PDFs yet" : "No results found"}
                            </p>
                            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                                {docs.length === 0
                                    ? "Upload your notes, aptitude books, or study material. They'll be saved permanently."
                                    : "Try a different search or category."}
                            </p>
                        </div>
                        {docs.length === 0 && (
                            <button onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black"
                                style={{ background: "linear-gradient(135deg,#16614f,#5ec4a8)", color: "#fff" }}>
                                <Plus size={15} /> Upload First PDF
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(doc => (
                            <PDFCard key={doc._id} doc={doc}
                                onOpen={() => setOpenDoc(doc)}
                                onDelete={() => setDeleteTarget(doc)} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes svFade { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }

        .sv-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          transition: transform .18s, box-shadow .18s;
        }
        .sv-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.1); }
        .sv-card-strip { height: 4px; width: 100%; }

        .sv-drop {
          border: 2px dashed;
          border-radius: 18px;
          padding: 20px;
          cursor: pointer;
          transition: all .2s;
        }

        .sv-field { display: flex; flex-direction: column; gap: 5px; }
        .sv-label { font-size: .75rem; font-weight: 700; color: var(--muted-foreground); }
        .sv-input {
          height: 44px; border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--muted);
          padding: 0 12px;
          font-size: .88rem;
          color: var(--foreground);
          outline: none;
          width: 100%;
          transition: border-color .15s;
        }
        .sv-input:focus { border-color: var(--primary); }
      `}</style>
        </>
    );
}
