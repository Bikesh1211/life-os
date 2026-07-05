"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconClock } from "@tabler/icons-react";

type MemoryEntry = {
  id: string;
  title: string;
  context: string;
  mood: string | null;
  trackName: string | null;
  artistName: string | null;
  memoryDate: string | null;
};

type RewindData = {
  month: number;
  day: number;
  memories: MemoryEntry[];
};

export function MemoryRewind() {
  const { data, isLoading } = useQuery<RewindData>({
    queryKey: ["music-on-this-day"],
    queryFn: async () => {
      const res = await fetch("/api/music/on-this-day");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4">
        <div className="mb-3 h-5 w-36 rounded bg-[var(--mantine-color-dark-5,#25262b)]" />
        <div className="h-12 rounded bg-[var(--mantine-color-dark-5,#25262b)]" />
      </div>
    );
  }

  const memories = data?.memories ?? [];
  if (memories.length === 0) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
        <IconClock size={16} />
        On This Day — {dateStr}
      </h3>

      <div className="space-y-2">
        {memories.slice(0, 3).map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                {memory.title}
              </span>
              {memory.mood && (
                <span className="text-sm">{memory.mood}</span>
              )}
            </div>
            <p className="line-clamp-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
              {memory.context}
            </p>
            {(memory.trackName || memory.artistName) && (
              <p className="mt-1 text-[11px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                ♪ {memory.trackName}{memory.artistName ? ` · ${memory.artistName}` : ""}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
