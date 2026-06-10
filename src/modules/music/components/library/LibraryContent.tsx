"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import Link from "next/link";
import { IconGridDots, IconList, IconTrash, IconSearch } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type LibraryTrack = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumTitle: string | null;
  albumCoverUrl: string | null;
  duration: number | null;
  addedAt: string;
};

export function LibraryContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["music-library-songs"],
    queryFn: async () => {
      const res = await fetch("/api/music/library?limit=200");
      if (!res.ok) throw new Error("Failed to load library");
      return res.json() as Promise<{ tracks: LibraryTrack[]; total: number }>;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const res = await fetch(`/api/music/library?trackId=${encodeURIComponent(trackId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from library");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-library-songs"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Failed to remove",
        message: err instanceof Error ? err.message : "An error occurred",
        color: "red",
      });
    },
  });

  const tracks = data?.tracks ?? [];
  const filtered = searchQuery
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artistName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tracks;

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
            ))}
          </div>
        </div>
      </MusicContainer>
    );
  }

  if (tracks.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="Your library is empty"
          description="Search for songs to add to your music collection."
          action={{ label: "Search music", onClick: () => window.location.href = "/music/search" }}
        />
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Library
          </h1>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            {tracks.length} song{tracks.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mantine-color-dimmed,#5c5f66)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter songs..."
              className="w-48 rounded-lg border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] py-2 pl-9 pr-3 text-sm text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none transition-all focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-[var(--mantine-color-dimmed,#5c5f66)] hover:text-[var(--mantine-color-text,#c1c2c5)]"}`}
          >
            <IconGridDots size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-[var(--mantine-color-dimmed,#5c5f66)] hover:text-[var(--mantine-color-text,#c1c2c5)]"}`}
          >
            <IconList size={18} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No songs match your filter.</p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="group relative"
            >
              <Link href={`/music/song/${track.id}`}>
                <div className="aspect-square overflow-hidden rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
                  {track.albumCoverUrl ? (
                    <img src={track.albumCoverUrl} alt={track.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--mantine-color-dimmed,#5c5f66)]">No Art</div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="truncate text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">{track.title}</p>
                  <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">{track.artistName}</p>
                </div>
              </Link>
              <button
                onClick={() => removeMutation.mutate(track.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <IconTrash size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[var(--mantine-color-dark-6,#1a1b1e)]"
            >
              <Link href={`/music/song/${track.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]">
                  {track.albumCoverUrl && <img src={track.albumCoverUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--mantine-color-text,#c1c2c5)]">{track.title}</p>
                  <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">{track.artistName}</p>
                </div>
              </Link>
              {track.albumTitle && (
                <span className="hidden truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)] sm:block max-w-[200px]">
                  {track.albumTitle}
                </span>
              )}
              <span className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}` : "--:--"}
              </span>
              <button
                onClick={() => removeMutation.mutate(track.id)}
                className="shrink-0 text-[var(--mantine-color-dimmed,#5c5f66)] opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
              >
                <IconTrash size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </MusicContainer>
  );
}
