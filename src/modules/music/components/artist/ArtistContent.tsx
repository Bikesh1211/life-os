"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicCard } from "../design-system/MusicCard";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { AddToCollectionButton } from "../design-system/AddToCollectionButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconExternalLink, IconHeart, IconHeartFilled } from "@tabler/icons-react";

type TrackItem = {
  id: string;
  title: string;
  duration: number | null;
  collectionName?: string | null;
  explicit?: boolean;
  previewUrl?: string | null;
  trackViewUrl?: string | null;
  trackNumber?: number | null;
};

type AlbumItem = {
  id: string;
  title: string;
  coverArtUrl: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  genre: string | null;
  explicit: boolean;
};

type ArtistData = {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  artistType: string | null;
  artistLinkUrl: string | null;
  albums: AlbumItem[];
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

  const queryClient = useQueryClient();
  const [favoriting, setFavoriting] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (action === "add") {
        const res = await fetch("/api/music/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotifyId: id, entityType: "artist" }),
        });
        if (!res.ok) throw new Error("Failed to favorite");
        return res.json();
      } else {
        const res = await fetch(`/api/music/favorites?entityType=artist&entityId=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unfavorite");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist", id] });
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
        <div className="flex flex-wrap items-center gap-3">
          {data.artistType && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              {data.artistType === "Group" ? "Group" : data.artistType === "Person" ? "Solo Artist" : data.artistType}
            </div>
          )}

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            First listened {data.stats.firstListened}
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {data.stats.totalPlays} plays
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {data.stats.listeningHours}h listened
          </div>

          <button
            onClick={() => {
              setFavoriting(true);
              if (data.isFavorited) {
                favoriteMutation.mutate("remove", {
                  onSettled: () => setFavoriting(false),
                });
              } else {
                favoriteMutation.mutate("add", {
                  onSettled: () => setFavoriting(false),
                });
              }
            }}
            disabled={favoriting}
            className="rounded-full px-3 py-1 text-sm backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            {data.isFavorited ? (
              <span className="flex items-center gap-1.5 text-pink-400">
                <IconHeartFilled size={16} />
                Favorited
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/80">
                <IconHeart size={16} />
                Favorite
              </span>
            )}
          </button>

          <AddToCollectionButton entityType="artist" entityId={data.id} />

          {data.artistLinkUrl && (
            <Link
              href={data.artistLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-3 py-1 text-sm text-blue-300 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <IconExternalLink size={14} className="inline -mt-0.5 mr-1" />
              Apple Music
            </Link>
          )}
        </div>
      </GradientHero>

      <MusicContainer>
        <div className="space-y-10">
          {hasAlbums && (
            <section>
              <SectionHeading title={`Albums (${data.albums.length})`} />
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
              <SectionHeading title={`Tracks (${data.topTracks.length})`} />
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
                      {track.explicit && (
                        <span className="text-[10px] font-semibold text-[var(--mantine-color-dimmed,#5c5f66)]">E</span>
                      )}
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