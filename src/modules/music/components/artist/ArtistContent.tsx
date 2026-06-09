"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { motion } from "framer-motion";
import Link from "next/link";

type TrackItem = {
  id: string;
  title: string;
  duration: number | null;
  collectionId?: string | null;
  collectionName?: string | null;
};

type ArtistData = {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  albums: Array<{ id: string; title: string; coverArtUrl: string | null; releaseDate: string | null }>;
  topTracks: TrackItem[];
  isFavorited: boolean;
  stats: { firstListened: string; totalPlays: number; listeningHours: number };
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ArtistContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const { data, isLoading } = useQuery<ArtistData>({
    queryKey: ["artist", id],
    queryFn: async () => {
      const res = await fetch(`/api/music/artists/${id}`);
      if (!res.ok) throw new Error("Artist not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState title="Artist not found" description="This artist doesn't exist in your library." />
      </MusicContainer>
    );
  }

  const hasAlbums = data.albums.length > 0;
  const hasTracks = data.topTracks.length > 0;

  return (
    <>
      <GradientHero
        imageUrl={data.imageUrl}
        title={data.name}
        subtitle={data.genres.slice(0, 3).join(" · ")}
      >
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            First listened {data.stats.firstListened}
          </div>
          <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {data.stats.totalPlays} plays
          </div>
          <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            {data.stats.listeningHours}h listened
          </div>
        </div>
      </GradientHero>

      <MusicContainer>
        <div className="space-y-10">
          {hasAlbums && (
            <section>
              <SectionHeading title="Albums" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
              >
                {data.albums.map((album, i) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/music/albums/${album.id}`}>
                      <MusicCard
                        imageUrl={album.coverArtUrl}
                        title={album.title}
                        subtitle={album.releaseDate?.slice(0, 4)}
                        size="md"
                      />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {hasTracks && (
            <section>
              <SectionHeading title="Tracks" />
              <div className="overflow-hidden rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)]">
                {data.topTracks.map((track, i) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/music/tracks/${track.id}`}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--mantine-color-dark-5,#25262b)]"
                    >
                      <span className="w-8 text-right text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                          {track.title}
                        </span>
                        {track.collectionName && (
                          <span className="block truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                            {track.collectionName}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                        {formatDuration(track.duration)}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!hasAlbums && !hasTracks && (
            <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
              No albums or tracks available for this artist.
            </p>
          )}
        </div>
      </MusicContainer>
    </>
  );
}