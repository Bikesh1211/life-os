"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { GoalsProgress } from "../dashboard/GoalsProgress";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { SectionHeading } from "../design-system/SectionHeading";

export function GoalsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["music-goals"],
    queryFn: async () => {
      const res = await fetch("/api/music/goals");
      if (!res.ok) throw new Error("Failed to load goals");
      return res.json() as Promise<{
        goals: Array<{ id: string; label: string; current: number; target: number; unit: string }>;
      }>;
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const goals = data?.goals ?? [];

  if (goals.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="No goals set"
          description="Set music listening goals to track your progress. Try an album-per-month challenge or explore new genres."
        />
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Music Goals
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Track your listening ambitions
        </p>
      </motion.div>

      <GoalsProgress goals={goals} />
    </MusicContainer>
  );
}
