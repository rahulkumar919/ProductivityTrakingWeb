"use client";

import { useCallback, useEffect, useState } from "react";
import type { LearningEntry } from "@/types";

const storageKey = (taskId: string) => `learning_log_${taskId}`;

function load(taskId: string): LearningEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(taskId));
    return raw ? (JSON.parse(raw) as LearningEntry[]) : [];
  } catch {
    return [];
  }
}

function save(taskId: string, entries: LearningEntry[]) {
  try {
    localStorage.setItem(storageKey(taskId), JSON.stringify(entries));
  } catch {
    console.warn("localStorage full — could not save learning log.");
  }
}

export function useLearningLog(taskId: string) {
  const [entries, setEntries] = useState<LearningEntry[]>([]);

  // Load on mount / taskId change
  useEffect(() => {
    setEntries(load(taskId));
  }, [taskId]);

  const addEntry = useCallback(
    (entry: Omit<LearningEntry, "id" | "taskId">) => {
      const newEntry: LearningEntry = {
        id: crypto.randomUUID(),
        taskId,
        ...entry,
      };
      setEntries((prev) => {
        const next = [newEntry, ...prev];
        save(taskId, next);
        return next;
      });
    },
    [taskId]
  );

  const deleteEntry = useCallback(
    (entryId: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== entryId);
        save(taskId, next);
        return next;
      });
    },
    [taskId]
  );

  const deleteImage = useCallback(
    (entryId: string, imageIndex: number) => {
      setEntries((prev) => {
        const next = prev.map((e) =>
          e.id === entryId
            ? { ...e, images: e.images.filter((_, i) => i !== imageIndex) }
            : e
        );
        save(taskId, next);
        return next;
      });
    },
    [taskId]
  );

  return { entries, addEntry, deleteEntry, deleteImage };
}
