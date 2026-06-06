"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import type { SessionMode } from "@/types";

const modeMinutes: Record<SessionMode, number> = {
  Pomodoro: 25,
  "Deep Work": 90,
  "Study Session": 60,
  "Coding Session": 60,
};

export function FocusTimer() {
  const [mode, setMode] = useState<SessionMode>("Pomodoro");
  const [taskTitle, setTaskTitle] = useState("");
  const [remaining, setRemaining] = useState(modeMinutes[mode] * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<Array<{ mode: SessionMode; taskTitle: string; minutes: number }>>([]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const display = useMemo(() => `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`, [remaining]);

  function stop() {
    const used = modeMinutes[mode] - Math.ceil(remaining / 60);
    if (used > 0) setSessions((current) => [{ mode, taskTitle, minutes: used }, ...current]);
    setRunning(false);
    setRemaining(modeMinutes[mode] * 60);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card className="text-center">
        <Label className="block text-left">Mode<Select value={mode} onChange={(event) => {
          const nextMode = event.target.value as SessionMode;
          setMode(nextMode);
          setRemaining(modeMinutes[nextMode] * 60);
          setRunning(false);
        }}><option>Pomodoro</option><option>Deep Work</option><option>Study Session</option><option>Coding Session</option></Select></Label>
        <Label className="mt-3 block text-left">Linked task<Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Optional task title" /></Label>
        <div className="my-8 font-mono text-7xl font-bold">{display}</div>
        <div className="grid grid-cols-4 gap-2">
          <Button title="Start" onClick={() => setRunning(true)}><Play size={16} /></Button>
          <Button title="Pause" onClick={() => setRunning(false)} className="bg-accent text-white"><Pause size={16} /></Button>
          <Button title="Resume" onClick={() => setRunning(true)}><RotateCcw size={16} /></Button>
          <Button title="Stop" onClick={stop} className="bg-foreground text-background"><Square size={16} /></Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Recent Sessions</h2>
        <div className="mt-4 space-y-3">
          {sessions.length === 0 && <p className="text-sm text-muted-foreground">Start a focus block to log time here.</p>}
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between rounded-md bg-muted p-3">
              <div><p className="font-medium">{session.mode}</p><p className="text-sm text-muted-foreground">{session.taskTitle || "Unlinked session"}</p></div>
              <span className="font-semibold">{session.minutes}m</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
