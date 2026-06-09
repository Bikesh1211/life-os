"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconTimelineEvent } from "@tabler/icons-react";

type TimelineEvent = {
  id: string;
  year: number;
  title: string;
  description: string | null;
  type: "album" | "artist" | "memory" | "journal";
};

export function TimelineContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["music-timeline"],
    queryFn: async () => {
      const res = await fetch("/api/music/timeline");
      if (!res.ok) throw new Error("Failed to load timeline");
      return res.json() as Promise<{ timeline: TimelineEvent[] }>;
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const timeline = data?.timeline ?? [];

  if (timeline.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="Your music timeline is empty"
          description="As you listen, journal, and create memories, your music journey will appear here chronologically."
        />
      </MusicContainer>
    );
  }

  const groupedByYear: Record<number, TimelineEvent[]> = {};
  for (const event of timeline) {
    if (!groupedByYear[event.year]) groupedByYear[event.year] = [];
    groupedByYear[event.year].push(event);
  }

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Music Timeline
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Your personal music journey through time
        </p>
      </motion.div>

      <div className="relative space-y-0">
        {years.map((year) => (
          <div key={year}>
            <div className="sticky top-0 z-10 py-4">
              <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">
                {year}
              </h2>
            </div>
            <div className="space-y-2 pb-8">
              {groupedByYear[year].map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--mantine-color-dark-6,#1a1b1e)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mantine-color-dark-6,#1a1b1e)]">
                    <IconTimelineEvent size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                        {event.description}
                      </p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)]">
                      {event.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MusicContainer>
  );
}
