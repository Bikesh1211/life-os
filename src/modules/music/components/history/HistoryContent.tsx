"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconClock } from "@tabler/icons-react";

type HistoryEntry = {
  id: string;
  trackName: string | null;
  artistName: string | null;
  listenedAt: string;
  duration: number | null;
};

export function HistoryContent() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["music-history"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/music/history?offset=${pageParam}&limit=30`);
      if (!res.ok) throw new Error("Failed to load history");
      return res.json() as Promise<{ entries: HistoryEntry[]; nextOffset: number | null }>;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const entries = data?.pages.flatMap((p) => p.entries) ?? [];

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (entries.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="No listening history yet"
          description="Start listening to music and your history will appear here. Connect Spotify to import automatically."
          action={{ label: "Connect Spotify", onClick: () => {} }}
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
          Listening History
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          {entries.length} entries
        </p>
      </motion.div>

      <div className="space-y-1">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.01 }}
            className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--mantine-color-dark-6,#1a1b1e)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)] text-lg text-[var(--mantine-color-dimmed,#5c5f66)]">
              ♪
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                {entry.trackName ?? "Unknown track"}
              </p>
              <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                {entry.artistName ?? "Unknown artist"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
              <IconClock size={12} />
              {new Date(entry.listenedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
              {entry.duration && (
                <span>{Math.round(entry.duration / 60)}m</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </MusicContainer>
  );
}
