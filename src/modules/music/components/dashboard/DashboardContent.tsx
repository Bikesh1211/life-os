"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { ListeningStats } from "./ListeningStats";
import { RecentlyPlayed } from "./RecentlyPlayed";
import { Obsessions } from "./Obsessions";
import { MusicMemories } from "./MusicMemories";
import { GoalsProgress } from "./GoalsProgress";

type DashboardData = {
  stats: {
    listeningTime: string;
    songsPlayed: number;
    albumsExplored: number;
    streak: number;
  };
  recentlyPlayed: Array<{
    id: string;
    title: string;
    coverArtUrl: string | null;
    artistName: string;
  }>;
  obsessions: Array<{
    id: string;
    title: string;
    type: "artist" | "album";
    imageUrl: string | null;
    stat: string;
  }>;
  memories: Array<{
    id: string;
    year: number;
    trackName: string;
    artistName: string;
    contextText: string;
  }>;
  goals: Array<{
    id: string;
    label: string;
    current: number;
    target: number;
    unit: string;
  }>;
};

export function MusicDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["music-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/music/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/music/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["music-journal"] });
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
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-44 w-44 shrink-0 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            ))}
          </div>
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="Welcome to your music world"
          description="Start by searching for your favorite artists, albums, or tracks. Connect Spotify to import your listening history automatically."
        />
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Your Music
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
            Your personal music command center
          </p>
        </div>
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          {seedMutation.isPending ? "Loading..." : "Load demo data"}
        </button>
      </motion.div>

      <div className="space-y-10">
        <ListeningStats stats={data.stats} />
        <RecentlyPlayed albums={data.recentlyPlayed} />
        <Obsessions items={data.obsessions} />
        <MusicMemories memories={data.memories} />
        <GoalsProgress goals={data.goals} />
      </div>
    </MusicContainer>
  );
}
