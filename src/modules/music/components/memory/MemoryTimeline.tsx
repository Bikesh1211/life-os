"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { IconMusic } from "@tabler/icons-react";

type MemoryTimelineEntry = {
  id: string;
  title: string;
  context: string;
  mood: string | null;
  memoryDate: string | null;
  trackName: string | null;
  artistName: string | null;
  createdAt: string;
};

type MemoryTimelineProps = {
  entries: MemoryTimelineEntry[];
  isLoading?: boolean;
  onEntryClick?: (id: string) => void;
};

function groupByMonth(entries: MemoryTimelineEntry[]) {
  const groups: Record<string, MemoryTimelineEntry[]> = {};
  for (const entry of entries) {
    const date = entry.memoryDate || entry.createdAt;
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function TimelineEntry({ entry, index, onClick }: { entry: MemoryTimelineEntry; index: number; onClick?: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      <div className="absolute left-[11px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--mantine-color-blue-6,#339af0)] bg-[var(--mantine-color-body,#0a0a0f)]" />
      <div className="absolute bottom-0 left-[15px] top-4 w-px bg-[var(--mantine-color-dark-4,#2e2f33)] last:hidden" />

      <div
        className="cursor-pointer rounded-lg border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]"
        onClick={() => onClick?.(entry.id)}
      >
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
            {entry.title}
          </h4>
          {entry.mood && (
            <span className="text-sm">{entry.mood}</span>
          )}
        </div>
        <p className="mb-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--mantine-color-dimmed,#5c5f66)]">
          {entry.context}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[var(--mantine-color-dimmed,#5c5f66)]">
          {(entry.trackName || entry.artistName) && (
            <span className="flex items-center gap-1">
              <IconMusic size={10} />
              {entry.trackName}{entry.artistName ? ` · ${entry.artistName}` : ""}
            </span>
          )}
          <span>
            {new Date(entry.memoryDate || entry.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function MemoryTimeline({ entries, isLoading, onEntryClick }: MemoryTimelineProps) {
  const grouped = useMemo(() => groupByMonth(entries), [entries]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-5 w-32 rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            <div className="h-20 rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)] text-2xl text-[var(--mantine-color-dimmed,#5c5f66)]">
          <IconMusic size={24} />
        </div>
        <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
          No memories yet
        </p>
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([monthKey, monthEntries]) => (
        <div key={monthKey} className="mb-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">
            {formatMonth(monthKey)}
          </h3>
          <div className="border-l-2 border-[var(--mantine-color-dark-4,#2e2f33)]">
            {monthEntries.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                index={i}
                onClick={onEntryClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
