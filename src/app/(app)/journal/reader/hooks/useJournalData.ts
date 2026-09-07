"use client";

import { useState, useCallback } from "react";
import type { ContentBlock, ReaderEntry } from "../types";

function textToBlocks(text: string | null): ContentBlock[] {
  if (!text) return [{ type: "paragraph", text: "No content yet." }];
  const blocks: ContentBlock[] = [];
  const rawBlocks = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  rawBlocks.forEach((raw) => {
    const lines = raw.split(/\n/);
    const first = lines[0].trim();

    if (first === "---" || first === "***") {
      blocks.push({ type: "chapterBreak" });
      return;
    }
    if (/^#{1,3}\s+/.test(first)) {
      blocks.push({
        type: "heading",
        level: /^#{1}\s/.test(first) ? 2 : 3,
        text: first.replace(/^#{1,3}\s+/, ""),
      });
      return;
    }
    if (first.startsWith("> ")) {
      blocks.push({ type: "quote", text: first.slice(2) });
      return;
    }
    blocks.push({ type: "paragraph", text: raw });
  });

  return blocks.length ? blocks : [{ type: "paragraph", text }];
}

function mapEntry(row: any, ordinal: number): ReaderEntry {
  const moodLabel = (m: string | null) => {
    const map: Record<string, string> = {
      happy: "Happy", sad: "Sad", neutral: "Neutral",
      anxious: "Anxious", stressed: "Stressed", motivated: "Motivated", excited: "Excited",
    };
    return m ? map[m] || m : "";
  };

  const date = row.eventDate || row.createdAt;
  const iso = date ? new Date(date).toISOString().slice(0, 10) : "";

  return {
    id: ordinal,
    uuid: row.id,
    date: iso,
    title: row.title || "Untitled",
    mood: moodLabel(row.mood),
    tags: row.tags || [],
    readTime: 0,
    content: textToBlocks(row.content),
  };
}

function wordsOfEntry(entry: ReaderEntry): number {
  const text = entry.content
    .map((b) => ("text" in b ? b.text : ""))
    .join(" ");
  return text.replace(/[^a-z0-9'\s]/gi, " ").split(/\s+/).filter(Boolean).length;
}

function readMinutes(entry: ReaderEntry): number {
  return entry.readTime || Math.max(1, Math.round(wordsOfEntry(entry) / 200));
}

export function useJournalData() {
  const [entries, setEntries] = useState<ReaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const rows = await res.json();
        const mapped = rows
          .filter((r: any) => !r.deletedAt)
          .sort((a: any, b: any) => {
            const da = a.eventDate || a.createdAt;
            const db = b.eventDate || b.createdAt;
            return new Date(db).getTime() - new Date(da).getTime();
          })
          .map((r: any, i: number) => mapEntry(r, i + 1));
        setEntries(mapped);
      }
    } catch {}
    setLoading(false);
  }, []);

  return { entries, loading, load, wordsOfEntry, readMinutes };
}
