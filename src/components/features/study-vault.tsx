"use client";

import {
    ArrowLeft, BookMarked, BookOpen, Check, ChevronLeft, ChevronRight, Download, ExternalLink,
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
    "All", "General", "DSA", "System Design", "DBMS", "OS",
    "Networking", "OOP", "Mathematics", "Aptitude", "Other",
];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

/* ─── Helpers ───────────────────────────────────────────────────── */
function removeCachedPdf(id: string) {
    try { localStorage.removeItem(`sv_pdf_${id}`); } catch { /* ignore */ }
}

function fmtSize(b: number) {
    if (!b) return "0 B";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Upload Modal (Responsive Bottom-Sheet on Mobile, Centered on Desktop) ──────────────── */
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
        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are supported.");
            return;
        }
        if (f.size > 50 * 1024 * 1024) {
            setError("PDF must be under 50 MB.");
            return;
        }
        setFile(f);
        if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) { setError("Please choose a PDF file."); return; }
        if (!title.trim()) { setError("Please enter a title for your document."); return; }

        setUploading(true);
        setError("");

        try {
            // Direct binary stream upload: completely avoids FormData limits & stream errors
            const uploadUrl = `/api/study-pdfs?title=${encodeURIComponent(title.trim())}&category=${encodeURIComponent(category)}`;
            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf",
                    "X-File-Name": encodeURIComponent(file.name),
                    "X-File-Size": String(file.size),
                    "X-File-Title": encodeURIComponent(title.trim()),
                    "X-File-Category": encodeURIComponent(category),
                },
                body: file,
            });

            let json: Record<string, unknown>;
            const contentType = res.headers.get("content-type") ?? "";
            if (contentType.includes("application/json")) {
                json = await res.json() as Record<string, unknown>;
            } else {
                const text = await res.text();
                if (!res.ok) throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
                throw new Error("Unexpected response from server.");
            }

            if (!res.ok) {
                throw new Error((json.error as string) ?? "Upload failed");
            }

            onUploaded(json as unknown as PDFDoc);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Try again.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl transition-transform max-h-[92dvh] overflow-y-auto"
                style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                    paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 16px))",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile drag handle */}
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto mb-4 sm:hidden" />

                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                            Upload PDF
                        </h2>
                        <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            Stored permanently in your database
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-muted active:scale-95 transition-all"
                        aria-label="Close"
                    >
                        <X size={18} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* File Picker Zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
                        onClick={() => inputRef.current?.click()}
                        className="rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all border-2 border-dashed active:scale-[0.99]"
                        style={{
                            borderColor: file ? "var(--primary)" : dragging ? "var(--primary)" : "var(--border)",
                            background: file ? "rgba(22,97,79,0.08)" : dragging ? "rgba(22,97,79,0.05)" : "var(--muted)",
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
                        />

                        {file ? (
                            <div className="flex items-center gap-3 text-left">
                                <div className="flex size-12 items-center justify-center rounded-2xl shrink-0"
                                    style={{ background: "rgba(22,97,79,0.15)", color: "var(--primary)" }}>
                                    <FileText size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>
                                            {file.name}
                                        </p>
                                        <span className="text-emerald-500 shrink-0"><Check size={14} /></span>
                                    </div>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                        {fmtSize(file.size)} · Tap to change
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-2">
                                <div className="flex size-12 items-center justify-center rounded-2xl mx-auto mb-2.5"
                                    style={{ background: "rgba(22,97,79,0.1)", color: "var(--primary)" }}>
                                    <Upload size={22} />
                                </div>
                                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                                    Tap to choose PDF from device
                                </p>
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    Books, Notes, Question Banks · Up to 50 MB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Title Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                            Document Title *
                        </label>
                        <input
                            className="w-full h-11 rounded-xl px-3.5 text-sm outline-none transition-all border"
                            style={{
                                background: "var(--muted)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                            }}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. System Design Cheat Sheet"
                            required
                        />
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                            Category
                        </label>
                        <select
                            className="w-full h-11 rounded-xl px-3.5 text-sm outline-none transition-all border"
                            style={{
                                background: "var(--muted)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                            }}
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {CATEGORIES.filter(c => c !== "All").map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
                            style={{ background: "var(--muted)", color: "var(--foreground)" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-black text-white active:scale-[0.98] transition-all disabled:opacity-50"
                            style={{
                                background: uploading ? "var(--muted)" : "linear-gradient(135deg,#16614f,#5ec4a8)",
                                boxShadow: "0 4px 14px rgba(22,97,79,0.3)",
                            }}
                        >
                            {uploading ? (
                                <><Loader2 size={16} className="animate-spin" /> Storing in DB…</>
                            ) : (
                                <><Upload size={16} /> Upload & Save</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Premium Mobile & Desktop PDF Viewer ───────────────────────── */
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
    const [iframeError, setIframeError] = useState(false);

    // Direct endpoint streaming from MongoDB database
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

    useEffect(() => { setLoading(true); setIframeError(false); }, [page]);

    const pageNotes = doc.notes.filter(n => n.page === page);
    const pct = Math.round((page / Math.max(doc.totalPages, 1)) * 100);

    function saveNote() {
        if (!noteText.trim()) return;
        const note: PDFNote = { id: crypto.randomUUID(), page, text: noteText.trim(), createdAt: new Date().toISOString() };
        onAddNote(doc._id, note);
        setNoteText(""); setAddingNote(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col h-[100dvh] w-full overflow-hidden select-none"
            style={{ background: "#0a0f0d" }}
        >
            {/* ── Top App Bar (Mobile & Desktop) ── */}
            <header
                className="flex items-center justify-between px-3 sm:px-4 py-2 border-b shrink-0 h-13"
                style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "#0d1610",
                    paddingTop: "max(0.5rem, env(safe-area-inset-top, 8px))",
                }}
            >
                {/* Left: Back / Close with Document Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <button
                        onClick={onClose}
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white shrink-0"
                        title="Back to Vault"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white truncate leading-tight">
                            {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-white/50 truncate">
                                {doc.category}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">
                                · {pct}% read
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center / Right Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Page Pill */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-white/90"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                        <span>Pg {page}</span>
                        <span className="text-white/40">/{doc.totalPages}</span>
                    </div>

                    {/* Notes Toggle with Badge */}
                    <button
                        onClick={() => setShowNotes(v => !v)}
                        className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95"
                        style={{
                            background: showNotes ? `${doc.color}30` : "rgba(255,255,255,0.08)",
                            color: showNotes ? doc.color : "#fff",
                            border: `1px solid ${showNotes ? doc.color : "transparent"}`,
                        }}
                        title="Notes"
                    >
                        <StickyNote size={14} />
                        <span className="hidden sm:inline">Notes</span>
                        {doc.notes.length > 0 && (
                            <span
                                className="rounded-full px-1.5 py-0.2 text-[10px] font-black text-white shrink-0"
                                style={{ background: doc.color }}
                            >
                                {doc.notes.length}
                            </span>
                        )}
                    </button>

                    {/* External Link */}
                    <a
                        href={proxyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white/80 hover:text-white"
                        title="Open in Browser / Full View"
                    >
                        <ExternalLink size={15} />
                    </a>

                    {/* Download Link */}
                    <a
                        href={proxyUrl}
                        download={`${doc.title}.pdf`}
                        className="hidden sm:flex size-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white/80 hover:text-white"
                        title="Download PDF"
                    >
                        <Download size={15} />
                    </a>

                    {/* Fullscreen (Desktop only) */}
                    <button
                        onClick={() => setFullscreen(v => !v)}
                        className="hidden md:flex size-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all text-white/80 hover:text-white"
                        title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </header>

            {/* ── Main Content Area ── */}
            <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
                {/* PDF Viewer Canvas: 100% full bleed on mobile for maximum readability */}
                <div
                    className="flex-1 min-h-0 h-full w-full relative flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: "#111613" }}
                >
                    {/* Loading indicator */}
                    {loading && (
                        <div
                            className="absolute inset-0 flex items-center justify-center z-10"
                            style={{ background: "rgba(10,15,13,0.85)" }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={36} className="animate-spin" style={{ color: doc.color }} />
                                <p className="text-xs sm:text-sm font-semibold text-white/60">
                                    Loading Document…
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PDF iframe: takes 100% full height & width so native touch scrolling is 60fps */}
                    <div
                        className="w-full h-full flex-1 relative"
                        style={{
                            maxWidth: fullscreen ? "none" : 1100,
                            margin: "0 auto",
                            transform: zoom !== 100 ? `scale(${zoom / 100})` : "none",
                            transformOrigin: "top center",
                            transition: "transform 0.15s ease",
                        }}
                    >
                        {iframeError ? (
                            /* Fallback screen if browser blocks inline iframe */
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center"
                                style={{ background: "#0d1610" }}>
                                <div className="text-5xl">📄</div>
                                <h3 className="text-base sm:text-lg font-black text-white">{doc.title}</h3>
                                <p className="text-xs sm:text-sm text-white/60 max-w-xs">
                                    Document saved in database. Tap below to view in full reader mode:
                                </p>
                                <div className="flex gap-2.5 flex-wrap justify-center">
                                    <a
                                        href={proxyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white"
                                        style={{ background: doc.color }}
                                    >
                                        <ExternalLink size={14} /> Open in Native Reader
                                    </a>
                                    <a
                                        href={proxyUrl}
                                        download={`${doc.title}.pdf`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-white/10"
                                    >
                                        <Download size={14} /> Download PDF
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                key={`${doc._id}-${page}`}
                                src={iframeSrc}
                                title={doc.title}
                                onLoad={() => setLoading(false)}
                                onError={() => { setLoading(false); setIframeError(true); }}
                                className="w-full h-full block border-none"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    background: "#fff",
                                    display: "block",
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* ── Notes Drawer: Responsive Bottom-Sheet on Mobile, Sidebar on Desktop ── */}
                {showNotes && (
                    <div
                        className="fixed inset-x-0 bottom-0 z-30 max-h-[75dvh] sm:static sm:z-auto sm:max-h-none sm:w-80 shrink-0 flex flex-col border-t sm:border-t-0 sm:border-l shadow-2xl sm:shadow-none rounded-t-[28px] sm:rounded-none"
                        style={{
                            borderColor: "rgba(255,255,255,0.08)",
                            background: "#0d1610",
                            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 16px))",
                        }}
                    >
                        {/* Mobile drawer handle */}
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 sm:hidden" />

                        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <div>
                                <p className="font-black text-sm text-white">Notes</p>
                                <p className="text-[11px] text-white/40">
                                    Page {page} · {pageNotes.length} note{pageNotes.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setAddingNote(true)}
                                    disabled={addingNote}
                                    className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black disabled:opacity-40 active:scale-95 transition-all"
                                    style={{ background: `${doc.color}25`, color: doc.color }}
                                >
                                    <Plus size={12} /> Add
                                </button>
                                <button
                                    onClick={() => setShowNotes(false)}
                                    className="sm:hidden flex size-7 items-center justify-center rounded-lg hover:bg-white/10 text-white"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ scrollbarWidth: "thin" }}>
                            {/* Note input */}
                            {addingNote && (
                                <div
                                    className="rounded-2xl p-3 space-y-2 border"
                                    style={{ background: `${doc.color}0f`, borderColor: `${doc.color}35` }}
                                >
                                    <p className="text-xs font-black" style={{ color: doc.color }}>Note for Page {page}</p>
                                    <textarea
                                        autoFocus
                                        rows={3}
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Type key takeaway or formula…"
                                        className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
                                        style={{ background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
                                        onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveNote(); }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setAddingNote(false); setNoteText(""); }}
                                            className="flex-1 rounded-xl py-2 text-xs font-bold"
                                            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveNote}
                                            disabled={!noteText.trim()}
                                            className="flex-1 rounded-xl py-2 text-xs font-black disabled:opacity-40"
                                            style={{ background: doc.color, color: "#fff" }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No notes placeholder */}
                            {pageNotes.length === 0 && !addingNote && (
                                <div className="flex flex-col items-center gap-1.5 py-8 text-center">
                                    <StickyNote size={24} style={{ color: "rgba(255,255,255,0.15)" }} />
                                    <p className="text-xs text-white/40">No notes on page {page}</p>
                                    <button
                                        onClick={() => setAddingNote(true)}
                                        className="text-xs font-bold mt-1 text-emerald-400 underline decoration-dashed underline-offset-4"
                                    >
                                        + Add a quick note
                                    </button>
                                </div>
                            )}

                            {/* Note items */}
                            {pageNotes.map(note => (
                                <div
                                    key={note.id}
                                    className="rounded-2xl p-3 border group"
                                    style={{ background: `${doc.color}0a`, borderColor: `${doc.color}20` }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap flex-1">
                                            {note.text}
                                        </p>
                                        <button
                                            onClick={() => onDeleteNote(doc._id, note.id)}
                                            className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] mt-1.5 text-white/30">
                                        {new Date(note.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom Reader Toolbar (Mobile Friendly Navigation) ── */}
            <footer
                className="flex items-center justify-between px-3 sm:px-5 py-2 border-t shrink-0 h-13"
                style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "#0d1610",
                    paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 8px))",
                }}
            >
                {/* Prev Button */}
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 disabled:opacity-30 active:scale-95 transition-all"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Progress Bar & Jump */}
                <div className="flex-1 max-w-xs mx-3 sm:mx-6 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, background: doc.color }}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-white/50 shrink-0">
                        {pct}%
                    </span>
                </div>

                {/* Next Button */}
                <button
                    onClick={() => setPage(p => Math.min(doc.totalPages, p + 1))}
                    disabled={page >= doc.totalPages}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 disabled:opacity-30 active:scale-95 transition-all"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                </button>
            </footer>
        </div>
    );
}

/* ─── Premium PDF Card Component ─────────────────────────────────── */
function PDFCard({ doc, onOpen, onDelete }: { doc: PDFDoc; onOpen: () => void; onDelete: () => void }) {
    const pct = Math.round((doc.lastPage / Math.max(doc.totalPages, 1)) * 100);
    const done = pct >= 100;

    return (
        <div
            className="group rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden"
            style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
        >
            {/* Top Color Accent Strip */}
            <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: doc.color }}
            />

            <div>
                {/* Header row */}
                <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            className="flex size-11 items-center justify-center rounded-2xl shrink-0"
                            style={{ background: `${doc.color}18`, color: doc.color }}
                        >
                            <FileText size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className="font-black text-sm sm:text-base leading-snug truncate"
                                style={{ color: "var(--foreground)" }}
                                title={doc.title}
                            >
                                {doc.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span
                                    className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
                                    style={{ background: `${doc.color}15`, color: doc.color }}
                                >
                                    {doc.category}
                                </span>
                                <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                                    {fmtSize(doc.fileSize)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delete button: always accessible on mobile, hover on desktop */}
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="rounded-xl p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all shrink-0"
                        title="Delete Document"
                        aria-label="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Progress stats */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span style={{ color: "var(--muted-foreground)" }}>
                            {done ? "✓ Completed" : `Page ${doc.lastPage} of ${doc.totalPages}`}
                        </span>
                        <span style={{ color: done ? "#22c55e" : doc.color }}>
                            {pct}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${pct}%`,
                                background: done ? "#22c55e" : `linear-gradient(90deg, ${doc.color}88, ${doc.color})`,
                            }}
                        />
                    </div>
                </div>

                {/* Notes indicator */}
                {doc.notes.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold" style={{ color: doc.color }}>
                        <StickyNote size={12} />
                        <span>{doc.notes.length} note{doc.notes.length !== 1 ? "s" : ""}</span>
                    </div>
                )}
            </div>

            {/* Read Button */}
            <div className="mt-5">
                <button
                    onClick={onOpen}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-black text-white active:scale-[0.98] transition-all"
                    style={{
                        background: `linear-gradient(135deg, ${doc.color}ee, ${doc.color})`,
                        boxShadow: `0 4px 14px ${doc.color}35`,
                    }}
                >
                    <BookOpen size={16} />
                    <span>{pct === 0 ? "Start Reading" : done ? "Read Again" : "Continue Reading"}</span>
                </button>
            </div>
        </div>
    );
}

/* ─── Main StudyVault Page ───────────────────────────────────────── */
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
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

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
                <PDFViewer
                    doc={openDoc}
                    onClose={() => setOpenDoc(null)}
                    onProgress={handleProgress}
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="rounded-t-[28px] sm:rounded-3xl p-6 sm:p-7 text-center max-w-sm w-full shadow-2xl"
                        style={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 16px))",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex size-14 items-center justify-center rounded-2xl mx-auto mb-3 bg-red-500/10 text-red-500">
                            <Trash2 size={26} />
                        </div>
                        <h3 className="text-lg font-black" style={{ color: "var(--foreground)" }}>Delete PDF?</h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            &ldquo;{deleteTarget.title}&rdquo; and all attached notes will be permanently removed.
                        </p>
                        <div className="mt-5 flex gap-2.5">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold bg-muted text-foreground active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget)}
                                disabled={deleting}
                                className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm font-black text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4 sm:space-y-6">
                {/* ── Summary Stats (2x2 on Mobile, 4x1 on Desktop) ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    {[
                        { label: "Total Vault", value: docs.length, color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: BookMarked },
                        { label: "Completed", value: completed, color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: Check },
                        { label: "In Progress", value: docs.length - completed, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: BookOpen },
                        { label: "Total Notes", value: totalNotes, color: "#14b8a6", bg: "rgba(20,184,166,0.1)", icon: StickyNote },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div
                                key={s.label}
                                className="rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 border transition-transform active:scale-[0.99]"
                                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                            >
                                <div
                                    className="size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: s.bg, color: s.color }}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-muted-foreground truncate">{s.label}</p>
                                    <p className="text-lg sm:text-xl font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Mobile-Optimized Toolbar (Search + Horizontal Category Scroll) ── */}
                <div className="space-y-3">
                    {/* Search & Add Button row */}
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex items-center gap-2 flex-1 rounded-2xl border px-3 h-11"
                            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                        >
                            <Search size={16} className="text-muted-foreground shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by title or topic…"
                                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/70"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Add PDF Button */}
                        <button
                            onClick={() => setShowUpload(true)}
                            className="h-11 flex items-center gap-1.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shrink-0 active:scale-95 transition-all shadow-md"
                            style={{
                                background: "linear-gradient(135deg,#16614f,#5ec4a8)",
                                boxShadow: "0 4px 14px rgba(22,97,79,0.3)",
                            }}
                        >
                            <Plus size={16} />
                            <span>Add PDF</span>
                        </button>
                    </div>

                    {/* Horizontal Smooth-Scroll Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                        {CATEGORIES.map(c => {
                            const active = catFilter === c;
                            return (
                                <button
                                    key={c}
                                    onClick={() => setCatFilter(c)}
                                    className="rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95"
                                    style={{
                                        background: active ? "var(--primary)" : "var(--muted)",
                                        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                                    }}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Document Cards Grid ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 size={36} className="animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground">Loading your vault…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3.5 py-16 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <BookMarked size={30} />
                        </div>
                        <div>
                            <p className="font-black text-base text-foreground">
                                {docs.length === 0 ? "Your Vault is Empty" : "No Matches Found"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                                {docs.length === 0
                                    ? "Upload your DSA sheets, lecture PDFs, or notes to read and review them anywhere."
                                    : "Try searching for a different keyword or category."}
                            </p>
                        </div>
                        {docs.length === 0 && (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="mt-2 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-primary shadow-md active:scale-95 transition-all"
                            >
                                <Plus size={15} /> Upload Your First PDF
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(doc => (
                            <PDFCard
                                key={doc._id}
                                doc={doc}
                                onOpen={() => setOpenDoc(doc)}
                                onDelete={() => setDeleteTarget(doc)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Custom CSS for hidden scrollbars & smooth transitions */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}
