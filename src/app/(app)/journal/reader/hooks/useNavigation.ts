"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ReaderEntry } from "../types";

export function useNavigation(entries: ReaderEntry[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const transitioning = useRef(false);

  const goTo = useCallback(
    (index: number, instant = false) => {
      const total = entries.length;
      if (!total) return;
      const target = Math.min(Math.max(index, 0), total - 1);
      setCurrentIndex(target);
      try { localStorage.setItem("journal:last-entry", String(target)); } catch {}
      window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
    },
    [entries.length],
  );

  const navTo = useCallback(
    (dir: number) => {
      const target = currentIndex + dir;
      if (target < 0 || target >= entries.length) {
        return dir < 0 ? "first" : "last";
      }
      goTo(target);
      return null;
    },
    [currentIndex, entries.length, goTo],
  );

  useEffect(() => {
    if (!entries.length) return;
    try {
      const saved = parseInt(localStorage.getItem("journal:last-entry") || "0", 10);
      if (!isNaN(saved) && saved > 0 && saved < entries.length) {
        setCurrentIndex(saved);
      }
    } catch {}
  }, [entries.length]);

  return { currentIndex, goTo, navTo };
}
