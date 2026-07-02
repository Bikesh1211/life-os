"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { StatCard } from "../design-system/StatCard";
import { IconChartBar, IconMusic, IconCalendar, IconMoodSmile } from "@tabler/icons-react";

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

type RecapData = {
  year: number;
  monthlyListening: any[];
  memoryCount: number;
  memories: any[];
  moodAnalytics: any[];
};

export function RecapContent({ year }: { year: number }) {
  const { data, isLoading } = useQuery<RecapData>({
    queryKey: ["music-recap", year],
    queryFn: async () => {
      const res = await fetch(`/api/music/recap/${year}`);
      if (!res.ok) throw new Error("Failed to load recap");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
      </MusicContainer>
    );
  }

  if (!data) return null;

  const totalListens = data.monthlyListening?.reduce((s: number, m: any) => s + m.count, 0) ?? 0;
  const topMood = data.moodAnalytics?.sort((a: any, b: any) => b.count - a.count)[0];

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          {data.year} Recap
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Your music year in review
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard value={totalListens} label="Times listened" icon={<IconMusic size={20} />} delay={0} />
        <StatCard value={data.memoryCount} label="Memories" icon={<IconCalendar size={20} />} delay={0.1} />
        {topMood && (
          <StatCard
            value={`${moodEmojis[topMood.mood] || "💭"} ${topMood.mood}`}
            label="Top mood"
            icon={<IconMoodSmile size={20} />}
            delay={0.2}
          />
        )}
        <StatCard
          value={data.monthlyListening?.length ?? 0}
          label="Active months"
          icon={<IconChartBar size={20} />}
          delay={0.3}
        />
      </div>

      {data.monthlyListening && data.monthlyListening.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            Monthly Listening
          </h2>
          <div className="flex items-end gap-2">
            {data.monthlyListening.map((m: any) => {
              const max = Math.max(...data.monthlyListening.map((x: any) => x.count));
              const height = max > 0 ? (m.count / max) * 200 : 0;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {m.count}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[var(--mantine-color-blue-6,#339af0)] to-[var(--mantine-color-blue-4,#74c0fc)] transition-all"
                    style={{ height: `${Math.max(height, 4)}px` }}
                  />
                  <span className="text-[10px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.memories && data.memories.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            Year Memories
          </h2>
          <div className="space-y-2">
            {data.memories.slice(0, 10).map((memory: any, i: number) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                    {memory.title}
                  </span>
                  {memory.mood && <span>{memory.mood}</span>}
                </div>
                <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">{memory.context}</p>
                {memory.memoryDate && (
                  <p className="mt-1 text-[10px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {new Date(memory.memoryDate).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </MusicContainer>
  );
}
