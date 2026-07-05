"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { StatCard } from "../design-system/StatCard";
import { MoodEntryModal } from "./MoodEntryModal";
import { IconPlus, IconMoodSmile } from "@tabler/icons-react";

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

type MoodEntry = {
  id: string;
  mood: string;
  note: string | null;
  createdAt: string;
};

type MoodAnalytics = {
  mood: string;
  count: number;
};

export function MoodContent() {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["music-mood"],
    queryFn: async () => {
      const res = await fetch("/api/music/mood?limit=100");
      if (!res.ok) throw new Error("Failed to load");
      return res.json() as Promise<{ entries: MoodEntry[]; analytics: MoodAnalytics[] }>;
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const entries = data?.entries ?? [];
  const analytics = data?.analytics ?? [];
  const totalEntries = analytics.reduce((s, a) => s + a.count, 0);
  const topMood = analytics.sort((a, b) => b.count - a.count)[0];

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Mood Tracking
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
            How does music make you feel?
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <IconPlus size={16} />
          Log mood
        </button>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          value={totalEntries}
          label="Total entries"
          icon={<IconMoodSmile size={20} />}
          delay={0}
        />
        {analytics.slice(0, 3).map((a, i) => (
          <StatCard
            key={a.mood}
            value={`${moodEmojis[a.mood] || "💭"} ${a.count}`}
            label={a.mood}
            delay={(i + 1) * 0.1}
          />
        ))}
      </div>

      {entries.length === 0 ? (
        <MusicEmptyState
          icon="💭"
          title="No mood entries yet"
          description="Log how music makes you feel and discover your emotional patterns."
          action={{ label: "Log first mood", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
            >
              <span className="text-2xl">{moodEmojis[entry.mood] || "💭"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-[var(--mantine-color-text,#c1c2c5)]">
                  {entry.mood}
                </p>
                {entry.note && (
                  <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {entry.note}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <MoodEntryModal opened={showModal} onClose={() => setShowModal(false)} />
    </MusicContainer>
  );
}
