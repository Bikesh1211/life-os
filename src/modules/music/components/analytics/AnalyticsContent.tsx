"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { StatCard } from "../design-system/StatCard";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconClock, IconMusic, IconFlame, IconMicrophone, IconCalendar } from "@tabler/icons-react";

type AnalyticsData = {
  totalListeningHours: number;
  todayMinutes: number;
  songsPlayed: number;
  currentStreak: number;
  longestStreak: number;
  topArtists: Array<{ name: string; count: number }>;
  yearlyStats: { totalSongs: number; uniqueArtists: number; uniqueAlbums: number };
};

export function AnalyticsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["music-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/music/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json() as Promise<AnalyticsData>;
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="No analytics yet"
          description="Start listening to music to see your listening insights and trends."
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
          Analytics
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Your listening insights
        </p>
      </motion.div>

      <div className="space-y-10">
        {/* Quick Stats */}
        <section>
          <SectionHeading title="Today" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={`${data.todayMinutes}m`}
              label="Listening time"
              icon={<IconClock size={18} />}
              delay={0}
            />
            <StatCard
              value={data.songsPlayed}
              label="Songs played"
              icon={<IconMusic size={18} />}
              delay={0.05}
            />
            <StatCard
              value={data.currentStreak}
              label="Day streak"
              icon={<IconFlame size={18} />}
              delay={0.1}
            />
            <StatCard
              value={`${Math.round(data.totalListeningHours)}h`}
              label="All time"
              icon={<IconClock size={18} />}
              delay={0.15}
            />
          </div>
        </section>

        {/* Top Artists */}
        {data.topArtists.length > 0 && (
          <section>
            <SectionHeading title="Top Artists" />
            <div className="space-y-1">
              {data.topArtists.slice(0, 10).map((artist, i) => (
                <motion.div
                  key={artist.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--mantine-color-dark-6,#1a1b1e)]"
                >
                  <span className="w-6 text-right text-sm font-bold text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                    {artist.name}
                  </span>
                  <span className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {artist.count} plays
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Year in Review */}
        <section>
          <SectionHeading title="Year in Review" />
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">
                {data.yearlyStats.totalSongs}
              </p>
              <p className="mt-1 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                Songs
              </p>
            </div>
            <div className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">
                {data.yearlyStats.uniqueArtists}
              </p>
              <p className="mt-1 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                Artists
              </p>
            </div>
            <div className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">
                {data.yearlyStats.uniqueAlbums}
              </p>
              <p className="mt-1 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                Albums
              </p>
            </div>
          </div>
        </section>
      </div>
    </MusicContainer>
  );
}
