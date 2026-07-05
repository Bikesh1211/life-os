"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { AddToCollectionButton } from "../design-system/AddToCollectionButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { IconExternalLink, IconHeart, IconHeartFilled } from "@tabler/icons-react";

type TrackItem = {
  id: string;
  title: string;
  duration: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  explicit: boolean;
  previewUrl: string | null;
  trackViewUrl: string | null;
  artistName: string;
};

type AlbumData = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistViewUrl: string | null;
  coverArtUrl: string | null;
  collectionViewUrl: string | null;
  releaseDate: string | null;
  totalTracks: number | null;
  genre: string | null;
  explicit: boolean;
  copyright: string | null;
  country: string | null;
  tracks: TrackItem[];
  isFavorited: boolean;
  stats: { plays: number; rating: number | null; listeningHours: number };
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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

  const queryClient = useQueryClient();
  const [favoriting, setFavoriting] = useState(false);

  const favoriteMutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (action === "add") {
        const res = await fetch("/api/music/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotifyId: id, entityType: "album" }),
        });
        if (!res.ok) throw new Error("Failed to favorite");
        return res.json();
      } else {
        const res = await fetch(`/api/music/favorites?entityType=album&entityId=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unfavorite");
        return res.json();
      }
    },
    onSuccess: (_data, action) => {
      notifications.show({ title: action === "add" ? "Favorited" : "Unfavorited", message: action === "add" ? "Album added to favorites" : "Album removed from favorites", color: action === "add" ? "green" : "orange" });
      queryClient.invalidateQueries({ queryKey: ["album", id] });
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

  return (
    <>
      <GradientHero
        imageUrl={data.coverArtUrl}
        title={data.title}
        subtitle={data.artistName}
      >
        <div className="flex flex-wrap items-center gap-3">
          {data.releaseDate && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {data.releaseDate.slice(0, 10)}
            </div>
          )}

          {data.genre && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              {data.genre}
            </div>
          )}

          {data.explicit && (
            <div className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              E
            </div>
          )}

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {data.totalTracks ?? data.tracks.length} tracks
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {data.stats.plays} plays
          </div>

          {data.stats.rating && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
              ★ {data.stats.rating}/10
            </div>
          )}

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

          <AddToCollectionButton entityType="album" entityId={data.id} />

          {data.collectionViewUrl && (
            <Link
              href={data.collectionViewUrl}
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
        <div className="space-y-6">
          {data.copyright && (
            <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">{data.copyright}</p>
          )}

          <section>
            <SectionHeading title="Tracklist" />
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              {data.tracks.length === 0 && (
                <p className="p-4 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No tracks yet.</p>
              )}
              {data.tracks.map((track, i) => (
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
                    <span className="w-6 text-right text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                      {track.trackNumber ?? i + 1}
                    </span>
                    <span className="flex-1 text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                      {track.title}
                    </span>
                    {track.explicit && (
                      <span className="text-[10px] font-semibold text-[var(--mantine-color-dimmed,#5c5f66)]">E</span>
                    )}
                    <span className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                      {formatDuration(track.duration)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </MusicContainer>
    </>
  );
}