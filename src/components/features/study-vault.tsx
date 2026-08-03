"use client";

import {
    BookMarked, BookOpen, ChevronLeft, ChevronRight,
    FileText, Maximize2, Minimize2, Plus, Search,
    StickyNote, Trash2, Upload, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
type PDFNote = {
    id: string;
    page: number;
    text: string;
    createdAt: string;
};

type PDFDoc = {
    id: string;
    name: string;
    size: number;          // bytes
    totalPages: number;
    lastPage: number;      // resume reading
    data: string;          // base64 data URL
    notes: PDFNote[];
    addedAt: string;
    color: string;         // accent color for card
};

/* ─── Storage ────────────────────────────────────────────────────── */
const VAULT_KEY = "devtrack_study_vault";
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899", "#8b5cf6", "#f97316"];

function loadVault(): PDFDoc[] {
    try { const r = localStorage.getItem(VAULT_KEY); return r ? JSON.parse(r) : []; }
    catch { return []; }
}
function saveVault(docs: PDFDoc[]) {
    try { localStorage.setItem(VAULT_KEY, JSON.stringify(docs)); }
    catch { alert("Storage full. Please delete some PDFs to free space."); }
}

function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── File → base64 ──────────────────────────────────────────────── */
function fileToBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

/* ─── Delete Confirm Modal ───────────────────────────────────────── */
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={onCancel}>
            <div className="rounded-3xl p-8 text-center max-w-sm w-full mx-4"
                style={{ background: "var(--card)", border: "1px solid var(--border)", animation: "svFade .25s ease" }}
                onClick={e => e.stopPropagation()}>
                <div className="flex size-16 items-center justify-center rounded-2xl mx-auto mb-4"
                    style={{ background: "rgba(239,68,68,0.1)" }}>
                    <Trash2 size={28} style={{ color: "#ef4444" }} />
                </div>
                <h3 className="text-lg font-black">Delete PDF?</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    &ldquo;{name}&rdquo; and all its notes will be permanently removed.
                </p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="flex-1 rounded-2xl py-3 text-sm font-bold"
                        style={{ background: "var(--muted)", color: "var(--foreground)" }}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 rounded-2xl py-3 text-sm font-black"
                        style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ─── PDF Viewer (full page) ─────────────────────────────────────── */
interface PDFViewerProps {
    doc: PDFDoc;
    onClose: () => void;
    onSaveProgress: (id: string, page: number) => void;
    onAddNote: (id: string, note: PDFNote) => void;
    onDeleteNote: (docId: string, noteId: string) => void;
}

function PDFViewer({ doc, onClose, onSaveProgress, onAddNote, onDeleteNote }: PDFViewerProps) {
    const [page, setPage] = useState(doc.lastPage || 1);
    const [zoom, setZoom] = useState(100);
    const [fullscreen, setFullscreen] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [addingNote, setAddingNote] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Build URL with page hash so browser PDF viewer jumps to page
    const pdfUrl = `${doc.data}#page=${page}`;

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !addingNote) onClose();
            if (e.key === "ArrowRight" && page < doc.totalPages) setPage(p => p + 1);
            if (e.key === "ArrowLeft" && page > 1) setPage(p => p - 1);
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [page, doc.totalPages, onClose, addingNote]);

    // Auto-save progress on page change
    useEffect(() => {
        onSaveProgress(doc.id, page);
    }, [page, doc.id, onSaveProgress]);

    const pageNotes = doc.notes.filter(n => n.page === page);

    function saveNote() {
        if (!noteText.trim()) return;
        const note: PDFNote = {
            id: crypto.randomUUID(),
            page,
            text: noteText.trim(),
            createdAt: new Date().toISOString(),
        };
        onAddNote(doc.id, note);
        setNoteText("");
        setAddingNote(false);
    }

    const pct = Math.round((page / doc.totalPages) * 100);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "#0a0f0d" }}
        >
            {/* ── Top bar ── */}
            <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0f1812" }}>

                {/* doc name + progress */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex size-9 items-center justify-center rounded-xl shrink-0"
                        style={{ background: `${doc.color}20` }}>
                        <FileText size={16} style={{ color: doc.color }} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-sm text-white truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                                <div className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%`, background: doc.color }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
                                {pct}% read
                            </span>
                        </div>
                    </div>
                </div>

                {/* page navigation */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                        className="flex size-9 items-center justify-center rounded-xl transition-all disabled:opacity-30 hover:bg-white/10"
                        style={{ color: "#fff" }} aria-label="Previous page">
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                        style={{ background: "rgba(255,255,255,0.07)" }}>
                        <input
                            type="number" min={1} max={doc.totalPages} value={page}
                            onChange={e => {
                                const v = Math.max(1, Math.min(doc.totalPages, Number(e.target.value)));
                                setPage(v);
                            }}
                            className="w-10 bg-transparent text-center text-sm font-black text-white outline-none"
                            style={{ MozAppearance: "textfield" } as React.CSSProperties}
                        />
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>/ {doc.totalPages}</span>
                    </div>

                    <button onClick={() => setPage(p => Math.min(doc.totalPages, p + 1))} disabled={page >= doc.totalPages}
                        className="flex size-9 items-center justify-center rounded-xl transition-all disabled:opacity-30 hover:bg-white/10"
                        style={{ color: "#fff" }} aria-label="Next page">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* zoom + tools */}
                <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.max(50, z - 10))}
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                        style={{ color: "#fff" }}><ZoomOut size={16} /></button>
                    <span className="text-xs font-bold w-10 text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {zoom}%
                    </span>
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))}
                        className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                        style={{ color: "#fff" }}><ZoomIn size={16} /></button>
                </div>

                <button
                    onClick={() => setShowNotes(v => !v)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all"
                    style={{
                        background: showNotes ? `${doc.color}25` : "rgba(255,255,255,0.07)",
                        color: showNotes ? doc.color : "#fff",
                        border: `1.5px solid ${showNotes ? doc.color + "40" : "transparent"}`,
                    }}>
                    <StickyNote size={13} />
                    Notes {doc.notes.length > 0 && `(${doc.notes.length})`}
                </button>

                <button onClick={() => setFullscreen(v => !v)}
                    className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                    style={{ color: "#fff" }}>
                    {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button onClick={onClose}
                    className="flex size-9 items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                    style={{ color: "#fff" }} aria-label="Close">
                    <X size={18} />
                </button>
            </div>

            {/* ── Content area ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* PDF iframe */}
                <div className="flex-1 overflow-auto flex items-start justify-center p-4"
                    style={{ background: "#1a1f1c" }}>
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform .2s", width: "100%", maxWidth: 900 }}>
                        <iframe
                            ref={iframeRef}
                            src={pdfUrl}
                            title={doc.name}
                            className="w-full rounded-xl border"
                            style={{
                                height: fullscreen ? "calc(100vh - 80px)" : "80vh",
                                borderColor: "rgba(255,255,255,0.08)",
                                background: "#fff",
                            }}
                        />
                    </div>
                </div>

                {/* Notes panel */}
                {showNotes && (
                    <div className="w-80 shrink-0 flex flex-col border-l"
                        style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0f1812" }}>

                        <div className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <div>
                                <p className="font-black text-sm text-white">Page Notes</p>
                                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    Page {page} · {pageNotes.length} note{pageNotes.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button onClick={() => setAddingNote(true)}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black"
                                style={{ background: `${doc.color}20`, color: doc.color }}>
                                <Plus size={12} /> Add
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {addingNote && (
                                <div className="rounded-2xl p-3 space-y-2 border"
                                    style={{ background: `${doc.color}10`, borderColor: `${doc.color}30` }}>
                                    <p className="text-xs font-bold" style={{ color: doc.color }}>Note for Page {page}</p>
                                    <textarea
                                        autoFocus rows={4} value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="Write your note…"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none"
                                        style={{ background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                                        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) saveNote(); }}
                                    />
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Ctrl+Enter to save</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setAddingNote(false); setNoteText(""); }}
                                            className="flex-1 rounded-xl py-2 text-xs font-bold"
                                            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                                            Cancel
                                        </button>
                                        <button onClick={saveNote}
                                            className="flex-1 rounded-xl py-2 text-xs font-black"
                                            style={{ background: doc.color, color: "#fff" }}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}

                            {pageNotes.length === 0 && !addingNote && (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                    <StickyNote size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
                                    <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>No notes on this page</p>
                                </div>
                            )}

                            {pageNotes.map(note => (
                                <div key={note.id} className="group rounded-2xl p-3 border"
                                    style={{ background: `${doc.color}0d`, borderColor: `${doc.color}25` }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm text-white leading-relaxed flex-1">{note.text}</p>
                                        <button onClick={() => onDeleteNote(doc.id, note.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 shrink-0"
                                            style={{ color: "#ef4444" }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        {new Date(note.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            ))}

                            {/* All notes summary */}
                            {doc.notes.length > 0 && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        All Notes ({doc.notes.length})
                                    </p>
                                    {doc.notes.map(note => (
                                        <div key={note.id} className="mb-2 rounded-xl p-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                                            style={{ background: "rgba(255,255,255,0.04)" }}
                                            onClick={() => setPage(note.page)}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="rounded-md px-1.5 py-0.5 text-xs font-black"
                                                    style={{ background: `${doc.color}25`, color: doc.color }}>
                                                    P{note.page}
                                                </span>
                                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs line-clamp-2" style={{ color: "rgba(255,255,255,0.6)" }}>{note.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom progress bar ── */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0f1812" }}>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${doc.color}99, ${doc.color})` }} />
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Page {page} of {doc.totalPages} · ← → navigate · Esc close
                </span>
            </div>
        </div>
    );
}

/* ─── PDF Card ───────────────────────────────────────────────────── */
interface PDFCardProps {
    doc: PDFDoc;
    onOpen: () => void;
    onDelete: () => void;
}
function PDFCard({ doc, onOpen, onDelete }: PDFCardProps) {
    const pct = Math.round((doc.lastPage / doc.totalPages) * 100);
    const isComplete = pct === 100;

    return (
        <div className="sv-card group" style={{ "--c": doc.color } as React.CSSProperties}>
            {/* color top strip */}
            <div className="sv-card-strip" style={{ background: doc.color }} />

            <div className="p-5 space-y-4">
                {/* header */}
                <div className="flex items-start gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl shrink-0"
                        style={{ background: `${doc.color}15`, border: `1.5px solid ${doc.color}25` }}>
                        <FileText size={22} style={{ color: doc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm leading-tight truncate" style={{ color: "var(--foreground)" }}>
                            {doc.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                            {fmtSize(doc.size)} · {doc.totalPages} pages · Added {fmtDate(doc.addedAt)}
                        </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-2 hover:bg-red-500/10"
                        style={{ color: "#ef4444" }} aria-label="Delete PDF">
                        <Trash2 size={15} />
                    </button>
                </div>

                {/* progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                            {isComplete ? "✓ Completed" : `Page ${doc.lastPage} / ${doc.totalPages}`}
                        </span>
                        <span className="text-xs font-black" style={{ color: isComplete ? "#22c55e" : doc.color }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: isComplete ? "#22c55e" : `linear-gradient(90deg,${doc.color}99,${doc.color})` }} />
                    </div>
                </div>

                {/* stats row */}
                <div className="flex items-center gap-2">
                    {doc.notes.length > 0 && (
                        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                            style={{ background: `${doc.color}12`, color: doc.color }}>
                            <StickyNote size={11} /> {doc.notes.length} note{doc.notes.length !== 1 ? "s" : ""}
                        </span>
                    )}
                    {isComplete && (
                        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                            ✓ Done
                        </span>
                    )}
                </div>

                {/* open button */}
                <button onClick={onOpen}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg,${doc.color}dd,${doc.color})`, color: "#fff", boxShadow: `0 4px 16px ${doc.color}35` }}>
                    <BookOpen size={15} />
                    {pct === 0 ? "Start Reading" : isComplete ? "Read Again" : "Continue Reading"}
                </button>
            </div>
        </div>
    );
}

/* ─── Upload Zone ────────────────────────────────────────────────── */
function UploadZone({ onUpload }: { onUpload: (files: FileList) => void }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className="sv-upload-zone"
            style={{ borderColor: dragging ? "var(--primary)" : "var(--border)", background: dragging ? "rgba(22,97,79,0.05)" : "var(--muted)" }}
        >
            <div className="flex size-16 items-center justify-center rounded-3xl mx-auto mb-4"
                style={{ background: dragging ? "rgba(22,97,79,0.15)" : "rgba(22,97,79,0.08)", transition: "all .2s" }}>
                <Upload size={28} style={{ color: "var(--primary)" }} />
            </div>
            <p className="font-black text-base" style={{ color: "var(--foreground)" }}>
                {dragging ? "Drop your PDF here" : "Upload PDF"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                Click or drag & drop · PDF files only
            </p>
            <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden"
                onChange={e => { if (e.target.files?.length) onUpload(e.target.files); }} />
        </div>
    );
}

/* ─── Main StudyVault Component ──────────────────────────────────── */
export function StudyVault() {
    const [docs, setDocs] = useState<PDFDoc[]>([]);
    const [hydrated, setHydrated] = useState(false);
    const [openDoc, setOpenDoc] = useState<PDFDoc | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PDFDoc | null>(null);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => { setDocs(loadVault()); setHydrated(true); }, []);

    function persist(next: PDFDoc[]) { setDocs(next); saveVault(next); }

    async function handleUpload(files: FileList) {
        setUploading(true);
        const next = [...docs];
        for (const file of Array.from(files)) {
            if (file.type !== "application/pdf") continue;
            const data = await fileToBase64(file);
            const color = COLORS[next.length % COLORS.length];
            const newDoc: PDFDoc = {
                id: crypto.randomUUID(),
                name: file.name.replace(/\.pdf$/i, ""),
                size: file.size,
                totalPages: 1,   // will be updated when user navigates
                lastPage: 1,
                data,
                notes: [],
                addedAt: new Date().toISOString(),
                color,
            };
            next.push(newDoc);
        }
        persist(next);
        setUploading(false);
    }

    const handleSaveProgress = useCallback((id: string, page: number) => {
        setDocs(prev => {
            const next = prev.map(d => {
                if (d.id !== id) return d;
                // Update lastPage only if advancing
                const lastPage = Math.max(d.lastPage, page);
                return { ...d, lastPage };
            });
            saveVault(next);
            // Keep viewer in sync
            setOpenDoc(cur => cur?.id === id ? { ...cur!, lastPage: Math.max(cur!.lastPage, page) } : cur);
            return next;
        });
    }, []);

    const handleAddNote = useCallback((docId: string, note: PDFNote) => {
        setDocs(prev => {
            const next = prev.map(d => d.id === docId ? { ...d, notes: [...d.notes, note] } : d);
            saveVault(next);
            setOpenDoc(cur => cur?.id === docId ? { ...cur!, notes: [...cur!.notes, note] } : cur);
            return next;
        });
    }, []);

    const handleDeleteNote = useCallback((docId: string, noteId: string) => {
        setDocs(prev => {
            const next = prev.map(d => d.id === docId ? { ...d, notes: d.notes.filter(n => n.id !== noteId) } : d);
            saveVault(next);
            setOpenDoc(cur => cur?.id === docId ? { ...cur!, notes: cur!.notes.filter(n => n.id !== noteId) } : cur);
            return next;
        });
    }, []);

    function handleDelete(id: string) {
        persist(docs.filter(d => d.id !== id));
        setDeleteTarget(null);
    }

    const filtered = docs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));
    const totalNotes = docs.reduce((s, d) => s + d.notes.length, 0);
    const completed = docs.filter(d => d.lastPage >= d.totalPages && d.totalPages > 1).length;

    if (!hydrated) return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />)}
        </div>
    );

    return (
        <>
            {openDoc && (
                <PDFViewer doc={openDoc} onClose={() => setOpenDoc(null)}
                    onSaveProgress={handleSaveProgress} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
            )}
            {deleteTarget && (
                <DeleteModal name={deleteTarget.name}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)} />
            )}

            <div className="space-y-6">
                {/* ── Stats row ── */}
                {docs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "PDFs", value: docs.length, icon: FileText, color: "#6366f1" },
                            { label: "Completed", value: completed, icon: BookMarked, color: "#22c55e" },
                            { label: "In Progress", value: docs.length - completed, icon: BookOpen, color: "#f59e0b" },
                            { label: "Total Notes", value: totalNotes, icon: StickyNote, color: "#14b8a6" },
                        ].map(s => (
                            <div key={s.label} className="rounded-2xl border p-4 flex items-center gap-3"
                                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                                <div className="flex size-10 items-center justify-center rounded-xl shrink-0"
                                    style={{ background: `${s.color}15` }}>
                                    <s.icon size={18} style={{ color: s.color }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black" style={{ color: "var(--foreground)" }}>{s.value}</p>
                                    <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Search bar ── */}
                {docs.length > 1 && (
                    <div className="relative">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search PDFs…"
                            className="w-full rounded-2xl border pl-11 pr-4 py-3 text-sm outline-none"
                            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    </div>
                )}

                {/* ── Upload zone ── */}
                {uploading ? (
                    <div className="sv-upload-zone" style={{ borderColor: "var(--primary)", background: "rgba(22,97,79,0.05)" }}>
                        <div className="flex size-16 items-center justify-center rounded-3xl mx-auto mb-4"
                            style={{ background: "rgba(22,97,79,0.1)" }}>
                            <Upload size={28} className="animate-bounce" style={{ color: "var(--primary)" }} />
                        </div>
                        <p className="font-black text-base">Processing PDF…</p>
                        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Converting to base64, please wait</p>
                    </div>
                ) : (
                    <UploadZone onUpload={handleUpload} />
                )}

                {/* ── PDF grid ── */}
                {filtered.length === 0 && docs.length > 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center"
                        style={{ borderColor: "var(--border)" }}>
                        <Search size={32} style={{ color: "var(--muted-foreground)" }} />
                        <p className="font-bold">No PDFs match &ldquo;{search}&rdquo;</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(doc => (
                            <PDFCard key={doc.id} doc={doc}
                                onOpen={() => setOpenDoc(doc)}
                                onDelete={() => setDeleteTarget(doc)} />
                        ))}
                    </div>
                )}

                {/* ── Empty state ── */}
                {docs.length === 0 && !uploading && (
                    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed py-16 text-center"
                        style={{ borderColor: "var(--border)" }}>
                        <div className="flex size-20 items-center justify-center rounded-3xl"
                            style={{ background: "rgba(22,97,79,0.08)" }}>
                            <FileText size={36} style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p className="font-black text-lg">No PDFs yet</p>
                            <p className="text-sm mt-1 max-w-xs" style={{ color: "var(--muted-foreground)" }}>
                                Upload your notes, aptitude books, or any study material. Read page by page with notes and progress tracking.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .sv-card {
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--card);
          overflow: hidden;
          transition: box-shadow .2s, transform .2s;
          position: relative;
        }
        .sv-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .sv-card-strip { height: 4px; width: 100%; }

        .sv-upload-zone {
          border-radius: 24px;
          border: 2px dashed;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all .2s;
        }
        .sv-upload-zone:hover { border-color: var(--primary) !important; background: rgba(22,97,79,0.04) !important; }

        @keyframes svFade {
          from { opacity: 0; transform: scale(.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </>
    );
}
