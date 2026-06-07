"use client";

import { useCallback, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type UseAutoSaveOptions = {
  onSave: () => Promise<void>;
  debounceMs?: number;
};

export function useAutoSave({ onSave, debounceMs = 2000 }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await onSave();
        setStatus("saved");
        lastSaveRef.current = Date.now();
      } catch {
        setStatus("error");
      }
    }, debounceMs);
  }, [onSave, debounceMs]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    try {
      await onSave();
      setStatus("saved");
      lastSaveRef.current = Date.now();
    } catch {
      setStatus("error");
    }
  }, [onSave]);

  return { status, scheduleSave, saveNow };
}
