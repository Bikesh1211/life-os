"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import Link from "next/link";

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  type: "artist" | "album" | "track";
};

export function LibraryContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["music-library"],
    queryFn: async () => {
      const res = await fetch("/api/music/library");
      if (!res.ok) throw new Error("Failed to load library");
      return res.json() as Promise<{ albums: LibraryItem[]; artists: LibraryItem[] }>;
    },
  });

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

  const albums = data?.albums ?? [];
  const artists = data?.artists ?? [];

  if (albums.length === 0 && artists.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="Your library is empty"
          description="Search for music to add to your library. Your saved albums and artists will appear here."
          action={{ label: "Search music", onClick: () => window.location.href = "/music/search" }}
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
          Library
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Your saved music
        </p>
      </motion.div>

      <div className="space-y-10">
        {albums.length > 0 && (
          <section>
            <SectionHeading title="Albums" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {albums.map((album, i) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/music/albums/${album.id}`}>
                    <MusicCard
                      imageUrl={album.imageUrl}
                      title={album.title}
                      subtitle={album.subtitle}
                      aspectRatio="portrait"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {artists.length > 0 && (
          <section>
            <SectionHeading title="Artists" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/music/artists/${artist.id}`}>
                    <MusicCard
                      imageUrl={artist.imageUrl}
                      title={artist.title}
                      subtitle={artist.subtitle}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </MusicContainer>
  );
}
