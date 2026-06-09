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

type ArtistData = {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  country: string | null;
  type: string | null;
  albums: Array<{ id: string; title: string; coverArtUrl: string | null; releaseDate: string | null }>;
  stats: { firstListened: string; totalPlays: number; listeningHours: number };
};

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
          <section>
            <SectionHeading title="Albums" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
            >
              {data.albums.length === 0 && (
                <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No albums yet.</p>
              )}
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
        </div>
      </MusicContainer>
    </>
  );
}
