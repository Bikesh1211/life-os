"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { motion } from "framer-motion";

type AlbumData = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverArtUrl: string | null;
  releaseDate: string | null;
  totalTracks: number | null;
  tracks: Array<{ id: string; title: string; duration: number | null; trackNumber: number | null }>;
  stats: { plays: number; rating: number | null; listeningHours: number };
};

export function AlbumContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const { data, isLoading } = useQuery<AlbumData>({
    queryKey: ["album", id],
    queryFn: async () => {
      const res = await fetch(`/api/music/albums/${id}`);
      if (!res.ok) throw new Error("Album not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState title="Album not found" description="This album doesn't exist in your library." />
      </MusicContainer>
    );
  }

  function formatDuration(seconds: number | null): string {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <GradientHero
        imageUrl={data.coverArtUrl}
        title={data.title}
        subtitle={data.artistName}
      >
        <div className="flex flex-wrap gap-3">
          {data.releaseDate && (
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {data.releaseDate.slice(0, 4)}
            </div>
          )}
          <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {data.totalTracks ?? data.tracks.length} tracks
          </div>
          <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {data.stats.plays} plays
          </div>
          {data.stats.rating && (
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              ★ {data.stats.rating}/10
            </div>
          )}
        </div>
      </GradientHero>

      <MusicContainer>
        <div className="space-y-10">
          <section>
            <SectionHeading title="Tracklist" />
            <div className="overflow-hidden rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)]">
              {data.tracks.length === 0 && (
                <p className="p-4 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No tracks yet.</p>
              )}
              {data.tracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--mantine-color-dark-5,#25262b)]"
                >
                  <span className="w-6 text-right text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {track.trackNumber ?? i + 1}
                  </span>
                  <span className="flex-1 text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                    {track.title}
                  </span>
                  <span className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {formatDuration(track.duration)}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </MusicContainer>
    </>
  );
}
