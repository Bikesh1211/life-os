"use client";

import { useState, useCallback, useMemo } from "react";
import type { ReaderEntry } from "../types";

type SearchItem = {
  idx: number;
  entry: ReaderEntry;
  haystack: string;
};

function entryText(entry: ReaderEntry): string {
  return entry.content
    .map((b) => ("text" in b ? b.text : ""))
    .join(" ");
}

export function useSearch(entries: ReaderEntry[]) {
  const [query, setQuery] = useState("");

  const index = useMemo<SearchItem[]>(
    () =>
      entries.map((entry, idx) => {
        const text = entryText(entry);
        const haystack = [
          entry.title,
          entry.date,
          entry.mood,
          entry.category || "",
          (entry.tags || []).join(" "),
          text,
        ]
          .join(" ")
          .toLowerCase();
        return { idx, entry, haystack };
      }),
    [entries],
  );

  const results = useMemo(() => {
    if (!query.trim()) return index;
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return index.filter((item) => words.every((w) => item.haystack.includes(w)));
  }, [index, query]);

  const snippet = useCallback(
    (item: SearchItem) => {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const text = entryText(item.entry);
      if (!words.length) return item.entry.content[0] && "text" in item.entry.content[0] ? item.entry.content[0].text.slice(0, 200) : "";

      const lower = text.toLowerCase();
      const idx = lower.indexOf(words[0]);
      const start = Math.max(0, idx - 60);
      const slice = text.slice(start, start + 200).replace(/\s+/g, " ");
      let out = slice
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      words.forEach((w) => {
        if (!w) return;
        const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
        out = out.replace(re, '<mark class="mark">$1</mark>');
      });
      return (start > 0 ? "…" : "") + out + (slice.length >= 200 ? "…" : "");
    },
    [query],
  );

  return { query, setQuery, results, snippet };
}
