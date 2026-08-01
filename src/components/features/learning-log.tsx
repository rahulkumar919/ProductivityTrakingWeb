"use client";

import {
  BookOpen, Calendar, ChevronLeft, ChevronRight,
  ImagePlus, Loader2, Play, Pause, Plus,
  Trash2, X, ZoomIn, Eye, RotateCcw, Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLearningLog } from "@/lib/useLearningLog";
import type { LearningEntry } from "@/types";

/* ──────────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────────── */
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function fmtDateShort(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}
function isToday(iso: string) {
  return iso === new Date().toISOString().split("T")[0];
}

/* Group entries by date, sorted newest first */
function groupByDate(entries: LearningEntry[]): { date: string; entries: LearningEntry[] }[] {
  const map = new Map<string, LearningEntry[]>();
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date)!.push(e);
  }
  // sort dates descending (newest first)
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entries]) => ({ date, entries }));
}

/* ──────────────────────────────────────────────────────────────────
   ACTIVITY HELPER
────────────────────────────────────────────────────────────────── */
const ACTIVITY_KEY = "devtrack_activities";
function appendActivity(type: string, description: string) {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({ id: crypto.randomUUID(), type, description, createdAt: new Date().toISOString() });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch { /* ignore */ }
}

/* ──────────────────────────────────────────────────────────────────
   LIGHTBOX — single image fullscreen
────────────────────────────────────────────────────────────────── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)" }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 rounded-full p-2.5"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }} aria-label="Close">
        <X size={20} />
      </button>
      <img src={src} alt="Full view"
        className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
        style={{ boxShadow: "0 12px 60px rgba(0,0,0,0.8)", animation: "llFade .25s ease" }}
        onClick={e => e.stopPropagation()} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   DAY REVISION MODAL — full screen for one specific day
────────────────────────────────────────────────────────────────── */
interface DayRevisionProps {
  date: string;
  dayNumber: number;
  entries: LearningEntry[];
  taskTitle: string;
  onClose: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}
function DayRevisionModal({ date, dayNumber, entries, taskTitle, onClose, onPrevDay, onNextDay, hasPrev, hasNext }: DayRevisionProps) {
  const slides = entries.flatMap(e => e.images.map(img => ({ img, note: e.note })));
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(slides.length > 1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((dir: 1 | -1) => setIdx(p => (p + dir + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    timer.current = setInterval(() => go(1), 3800);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, go, slides.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, go]);

  const notes = entries.map(e => e.note).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(180deg,#07110e 0%,#0d1a15 100%)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-4">
          {/* day badge */}
          <div className="flex flex-col items-center justify-center rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(94,196,168,0.15)", border: "1.5px solid rgba(94,196,168,0.25)", minWidth: 64 }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(94,196,168,0.7)" }}>Day</span>
            <span className="text-2xl font-black" style={{ color: "#5ec4a8", lineHeight: 1.1 }}>{dayNumber}</span>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-tight">{fmtDate(date)}</p>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{taskTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* day nav */}
          <button onClick={onPrevDay} disabled={!hasPrev}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-30 transition-all hover:bg-white/10"
            style={{ color: "#fff", background: "rgba(255,255,255,0.07)" }}>
            <ChevronLeft size={15} /> Prev Day
          </button>
          <button onClick={onNextDay} disabled={!hasNext}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-30 transition-all hover:bg-white/10"
            style={{ color: "#fff", background: "rgba(255,255,255,0.07)" }}>
            Next Day <ChevronRight size={15} />
          </button>

          {slides.length > 1 && (
            <button onClick={() => setPlaying(p => !p)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
              style={{ background: "rgba(94,196,168,0.15)", color: "#5ec4a8" }}>
              {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
            </button>
          )}

          <button onClick={onClose} className="rounded-full p-2.5 hover:bg-white/10 transition-colors"
            style={{ color: "#fff" }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      {slides.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <BookOpen size={48} style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="text-white font-bold text-xl">No images on this day</p>
          <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm">Only notes were recorded.</p>
          {notes.length > 0 && (
            <div className="mt-4 max-w-lg rounded-2xl p-6 text-center"
              style={{ background: "rgba(94,196,168,0.08)", border: "1px solid rgba(94,196,168,0.2)" }}>
              {notes.map((n, i) => <p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{n}</p>)}
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex-1 flex items-center justify-center px-6 py-4">
          <img key={`${date}-${idx}`} src={slides[idx].img} alt={`Day ${dayNumber} slide ${idx + 1}`}
            className="max-h-full max-w-full rounded-2xl object-contain"
            style={{ boxShadow: "0 16px 64px rgba(0,0,0,0.6)", animation: "llFade 0.3s ease" }} />

          {slides.length > 1 && (
            <>
              <button onClick={() => go(-1)} className="absolute left-4 rounded-full p-4 hover:scale-110 transition-all"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(4px)" }}>
                <ChevronLeft size={22} />
              </button>
              <button onClick={() => go(1)} className="absolute right-4 rounded-full p-4 hover:scale-110 transition-all"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(4px)" }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* image counter */}
          <div className="absolute top-4 right-4 rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}>
            {idx + 1} / {slides.length}
          </div>
        </div>
      )}

      {/* ── Footer — notes + dots ── */}
      <div className="px-6 pb-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {slides[idx]?.note && (
          <p className="text-center text-sm mb-3 font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
            <Sparkles size={13} className="inline mr-1.5" style={{ color: "#5ec4a8" }} />
            {slides[idx].note}
          </p>
        )}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mb-2 flex-wrap">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all"
                style={{ width: i === idx ? 24 : 8, height: 8, background: i === idx ? "#5ec4a8" : "rgba(255,255,255,0.2)" }}
                aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        )}
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          ← → navigate · Esc close
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ADD ENTRY FORM
────────────────────────────────────────────────────────────────── */
interface AddEntryFormProps {
  taskId: string;
  onAdd: (entry: Omit<LearningEntry, "id" | "taskId">) => void;
  onCancel: () => void;
}
function AddEntryForm({ onAdd, onCancel }: AddEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setLoading(true);
    const results: string[] = [];
    for (const f of Array.from(files)) {
      if (f.type.startsWith("image/")) results.push(await fileToBase64(f));
    }
    setImages(p => [...p, ...results]);
    setLoading(false);
  }

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <form onSubmit={e => { e.preventDefault(); onAdd({ date, note, images }); }}
        className="rounded-2xl border p-5 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--primary)", boxShadow: "0 0 0 2px rgba(22,97,79,0.12)" }}>

        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg" style={{ background: "rgba(22,97,79,0.12)" }}>
            <Plus size={14} style={{ color: "var(--primary)" }} />
          </div>
          <p className="font-bold text-sm" style={{ color: "var(--primary)" }}>Log Today&apos;s Learning</p>
        </div>

        {/* date picker */}
        <div className="grid gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm w-full outline-none"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
        </div>

        {/* note */}
        <div className="grid gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>What did you learn today?</label>
          <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
            placeholder="e.g. Understood two-pointer pattern, solved 3 problems on sliding window…"
            className="rounded-xl border px-3 py-2.5 text-sm w-full resize-none outline-none"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
        </div>

        {/* image upload */}
        <div className="grid gap-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Screenshots / Notes ({images.length} added)
          </label>
          <div onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            onDragOver={e => e.preventDefault()}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed py-6 cursor-pointer transition-all hover:border-primary/50"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            {loading ? <><Loader2 size={24} className="animate-spin" /><span className="text-sm">Processing…</span></>
              : <><ImagePlus size={24} /><span className="text-sm font-semibold">Click or drag & drop images</span><span className="text-xs opacity-60">JPG · PNG · WEBP — multiple OK</span></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* preview grid */}
        {images.length > 0 && (
          <div className="grid gap-2"
            style={{ gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border"
                style={{ borderColor: "var(--border)", aspectRatio: images.length === 1 ? "16/9" : "1" }}>
                <img src={img} alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setLightbox(img)} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  <button type="button" onClick={() => setLightbox(img)}
                    className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    <ZoomIn size={13} /></button>
                  <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                    className="rounded-full p-1.5" style={{ background: "rgba(239,68,68,0.8)", color: "#fff" }}>
                    <X size={13} /></button>
                </div>
                <span className="absolute bottom-1 right-1 rounded-md px-1.5 py-0.5 text-xs font-black"
                  style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>{i + 1}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2.5 justify-end pt-1">
          <button type="button" onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>Cancel</button>
          <button type="submit" disabled={loading}
            className="rounded-xl px-5 py-2.5 text-sm font-black flex items-center gap-2 transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <BookOpen size={14} /> Save Entry
          </button>
        </div>
      </form>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   DAY CARD — one card per date in the journal timeline
────────────────────────────────────────────────────────────────── */
interface DayCardProps {
  date: string;
  dayNumber: number;
  entries: LearningEntry[];
  isFirst: boolean;
  onRevise: () => void;
  onDelete: (id: string) => void;
  onDeleteImage: (id: string, idx: number) => void;
}
function DayCard({ date, dayNumber, entries, isFirst, onRevise, onDelete }: DayCardProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const today = isToday(date);
  const totalImages = entries.reduce((s, e) => s + e.images.length, 0);
  const allImages = entries.flatMap(e => e.images);
  const notes = entries.map(e => e.note).filter(Boolean);

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <div
        className="ll-day-card"
        style={{
          borderColor: today ? "rgba(22,97,79,0.4)" : "var(--border)",
          boxShadow: today ? "0 0 0 2px rgba(22,97,79,0.1)" : "none",
        }}
      >
        {/* ── Day header ── */}
        <div className="ll-day-header">
          {/* Day number + date */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="ll-day-badge"
              style={{
                background: today ? "var(--primary)" : isFirst ? "rgba(94,196,168,0.15)" : "var(--muted)",
                color: today ? "var(--primary-foreground)" : isFirst ? "#5ec4a8" : "var(--muted-foreground)",
                border: today ? "none" : `1.5px solid ${isFirst ? "rgba(94,196,168,0.3)" : "var(--border)"}`,
              }}>
              <span className="ll-day-num">{dayNumber}</span>
              <span className="ll-day-label">DAY</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-sm" style={{ color: "var(--foreground)" }}>{fmtDateShort(date)}</p>
                {today && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-black animate-pulse"
                    style={{ background: "rgba(22,97,79,0.15)", color: "var(--primary)" }}>Today</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
                {totalImages > 0 && ` · ${totalImages} image${totalImages !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {totalImages > 0 && (
              <button onClick={onRevise}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition-all hover:scale-105"
                style={{ background: "rgba(22,97,79,0.1)", color: "var(--primary)", border: "1.5px solid rgba(22,97,79,0.2)" }}>
                <Eye size={13} /> Revise
              </button>
            )}
          </div>
        </div>

        {/* ── Notes ── */}
        {notes.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(94,196,168,0.06)", border: "1px solid rgba(94,196,168,0.12)" }}>
                <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: "#5ec4a8" }} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{note}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Images — doc scanner layout ── */}
        {totalImages > 0 && (
          <div className="px-4 pb-4">
            {allImages.length === 1 ? (
              /* Single: full width */
              <div className="relative group rounded-2xl overflow-hidden border cursor-pointer"
                style={{ borderColor: "var(--border)" }} onClick={() => setLightbox(allImages[0])}>
                <img src={allImages[0]} alt="Learning note"
                  className="w-full object-contain transition-transform group-hover:scale-[1.01]"
                  style={{ maxHeight: 460, background: "var(--muted)" }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="rounded-2xl px-4 py-2 flex items-center gap-2 text-sm font-bold"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                    <ZoomIn size={16} /> View Full
                  </div>
                </div>
              </div>
            ) : allImages.length === 2 ? (
              /* Two: side by side */
              <div className="grid grid-cols-2 gap-2">
                {allImages.map((img, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden border cursor-pointer"
                    style={{ borderColor: "var(--border)", aspectRatio: "4/3" }} onClick={() => setLightbox(img)}>
                    <img src={img} alt={`Note ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.35)" }}>
                      <ZoomIn size={20} style={{ color: "#fff" }} />
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 rounded-lg px-1.5 py-0.5 text-xs font-black"
                      style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>{i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* 3+: hero + grid */
              <div className="space-y-2">
                <div className="relative group rounded-2xl overflow-hidden border cursor-pointer"
                  style={{ borderColor: "var(--border)" }} onClick={() => setLightbox(allImages[0])}>
                  <img src={allImages[0]} alt="Note 1"
                    className="w-full object-contain transition-transform group-hover:scale-[1.01]"
                    style={{ maxHeight: 360, background: "var(--muted)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.3)" }}>
                    <ZoomIn size={24} style={{ color: "#fff" }} />
                  </div>
                  <span className="absolute top-2.5 left-2.5 rounded-xl px-2.5 py-1 text-xs font-black"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
                    1 of {allImages.length}
                  </span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
                  {allImages.slice(1).map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border cursor-pointer"
                      style={{ borderColor: "var(--border)", aspectRatio: "1" }} onClick={() => setLightbox(img)}>
                      <img src={img} alt={`Note ${i + 2}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.4)" }}>
                        <ZoomIn size={16} style={{ color: "#fff" }} />
                      </div>
                      <span className="absolute bottom-1 right-1 rounded-md px-1.5 py-0.5 text-xs font-black"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>{i + 2}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Entry delete buttons ── */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {entries.map(entry => (
            <button key={entry.id} onClick={() => onDelete(entry.id)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors hover:bg-red-500/10"
              style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              title="Delete this entry">
              <Trash2 size={11} />
              Delete entry {entry.images.length > 0 ? `(${entry.images.length} img)` : "(text only)"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   MAIN LEARNING LOG EXPORT
────────────────────────────────────────────────────────────────── */
interface LearningLogProps { taskId: string; taskTitle: string; }

export function LearningLog({ taskId, taskTitle }: LearningLogProps) {
  const { entries, addEntry, deleteEntry, deleteImage } = useLearningLog(taskId);
  const [showForm, setShowForm] = useState(false);
  // Which day is open in revision modal (index into grouped array)
  const [revisingDayIdx, setRevisingDayIdx] = useState<number | null>(null);

  const grouped = groupByDate(entries); // newest first
  // Day numbers: oldest = Day 1 → newest = Day N
  const totalDays = grouped.length;

  function getDayNumber(groupIdx: number) {
    // groupIdx 0 = newest → dayNumber = totalDays
    return totalDays - groupIdx;
  }

  function handleAdd(entry: Omit<LearningEntry, "id" | "taskId">) {
    addEntry(entry);
    setShowForm(false);
    appendActivity(
      "Learning Entry Added",
      `"${taskTitle}" — ${fmtDateShort(entry.date)}${entry.images.length ? ` · ${entry.images.length} image${entry.images.length !== 1 ? "s" : ""}` : ""}`
    );
  }

  const totalImages = entries.reduce((s, e) => s + e.images.length, 0);

  return (
    <>
      {/* Day revision modal */}
      {revisingDayIdx !== null && grouped[revisingDayIdx] && (
        <DayRevisionModal
          date={grouped[revisingDayIdx].date}
          dayNumber={getDayNumber(revisingDayIdx)}
          entries={grouped[revisingDayIdx].entries}
          taskTitle={taskTitle}
          onClose={() => setRevisingDayIdx(null)}
          hasPrev={revisingDayIdx < grouped.length - 1}
          hasNext={revisingDayIdx > 0}
          onPrevDay={() => setRevisingDayIdx(i => (i !== null ? i + 1 : null))}
          onNextDay={() => setRevisingDayIdx(i => (i !== null ? i - 1 : null))}
        />
      )}

      <div className="mt-3 space-y-4">
        {/* ── Panel header ── */}
        <div className="ll-panel-header">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: "rgba(22,97,79,0.12)" }}>
              <BookOpen size={15} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <span className="font-black text-sm" style={{ color: "var(--foreground)" }}>Learning Journal</span>
              {grouped.length > 0 && (
                <span className="ml-2 text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                  {totalDays} day{totalDays !== 1 ? "s" : ""} · {totalImages} image{totalImages !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalImages > 0 && (
              <button onClick={() => setRevisingDayIdx(0)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90"
                style={{ background: "rgba(22,97,79,0.1)", color: "var(--primary)", border: "1.5px solid rgba(22,97,79,0.2)" }}>
                <RotateCcw size={12} /> Revise All
              </button>
            )}
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Plus size={13} /> Log Today
            </button>
          </div>
        </div>

        {/* ── Add form ── */}
        {showForm && (
          <AddEntryForm taskId={taskId} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        )}

        {/* ── Empty state ── */}
        {grouped.length === 0 && !showForm && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-10 text-center"
            style={{ borderColor: "var(--border)" }}>
            <div className="flex size-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(22,97,79,0.08)" }}>
              <Calendar size={26} style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <p className="font-black text-sm">Start your learning journal</p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--muted-foreground)" }}>
                Each day you learn something, log it here. Come back anytime to revise by date — Day 1, Day 2...
              </p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Plus size={15} /> Log Day 1
            </button>
          </div>
        )}

        {/* ── Day timeline ── */}
        {grouped.length > 0 && (
          <div className="ll-timeline">
            {grouped.map((group, gi) => (
              <div key={group.date} className="ll-timeline-item">
                {/* vertical line */}
                {gi < grouped.length - 1 && <div className="ll-timeline-line" />}
                {/* dot */}
                <div className="ll-timeline-dot"
                  style={{ background: isToday(group.date) ? "var(--primary)" : gi === 0 ? "rgba(94,196,168,0.8)" : "var(--muted-foreground)" }} />
                <div className="ll-timeline-content">
                  <DayCard
                    date={group.date}
                    dayNumber={getDayNumber(gi)}
                    entries={group.entries}
                    isFirst={gi === 0}
                    onRevise={() => setRevisingDayIdx(gi)}
                    onDelete={deleteEntry}
                    onDeleteImage={deleteImage}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* ── Panel header ── */
        .ll-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          padding: 14px 16px; border-radius: 16px;
          background: var(--muted); border: 1px solid var(--border);
        }

        /* ── Timeline ── */
        .ll-timeline { display: flex; flex-direction: column; gap: 0; padding-left: 20px; position: relative; }
        .ll-timeline-item { position: relative; padding-left: 24px; padding-bottom: 20px; }
        .ll-timeline-item:last-child { padding-bottom: 0; }
        .ll-timeline-dot {
          position: absolute; left: -5px; top: 20px;
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid var(--card);
          z-index: 1;
        }
        .ll-timeline-line {
          position: absolute; left: 0.5px; top: 28px; bottom: 0;
          width: 1px; background: var(--border);
        }
        .ll-timeline-content { width: 100%; }

        /* ── Day card ── */
        .ll-day-card {
          border-radius: 20px; border: 1px solid var(--border);
          background: var(--card); overflow: hidden;
          transition: box-shadow .2s, border-color .2s;
        }
        .ll-day-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .ll-day-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 14px 16px 12px;
        }
        .ll-day-badge {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; border-radius: 12px;
          width: 48px; height: 48px; flex-shrink: 0; transition: all .2s;
        }
        .ll-day-num { font-size: 18px; font-weight: 900; line-height: 1; }
        .ll-day-label { font-size: 9px; font-weight: 800; letter-spacing: .08em; opacity: .7; }

        /* ── Animations ── */
        @keyframes llFade {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
