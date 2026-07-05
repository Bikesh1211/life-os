"use client";

import { motion } from "framer-motion";
import { IconMoodSmile } from "@tabler/icons-react";

type MoodEntry = {
  id: string;
  mood: string;
  note: string | null;
  createdAt: string;
};

type MoodWidgetProps = {
  entries: MoodEntry[];
  isLoading?: boolean;
  onAddClick?: () => void;
};

const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  energetic: "🔥",
  calm: "🌊",
  anxious: "😰",
  excited: "🎉",
  nostalgic: "💭",
  inspired: "✨",
  focused: "🎯",
  tired: "😴",
};

export function MoodWidget({ entries, isLoading, onAddClick }: MoodWidgetProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4">
        <div className="mb-3 h-5 w-24 rounded bg-[var(--mantine-color-dark-5,#25262b)]" />
        <div className="h-16 rounded bg-[var(--mantine-color-dark-5,#25262b)]" />
      </div>
    );
  }

  const recent = entries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
          <IconMoodSmile size={16} />
          Mood
        </h3>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
          >
            + Log
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
          No mood entries yet. Start tracking how music makes you feel.
        </p>
      ) : (
        <div className="space-y-2">
          {recent.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg">{moodEmojis[entry.mood] || "💭"}</span>
              <div className="min-w-0 flex-1">
                {entry.note && (
                  <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {entry.note}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
