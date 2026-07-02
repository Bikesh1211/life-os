"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { MusicCard } from "../design-system/MusicCard";
import Link from "next/link";
import { IconHeartFilled, IconHeart, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type Favorite = {
  id: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  entityName: string | null;
  imageUrl: string | null;
};

export function FavoritesContent() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["music-favorites"],
    queryFn: async () => {
      const res = await fetch("/api/music/favorites");
      if (!res.ok) throw new Error("Failed to load favorites");
      return res.json() as Promise<Favorite[]>;
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
      const res = await fetch(
        `/api/music/favorites?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => {
      notifications.show({ title: "Removed", message: "Removed from favorites", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["music-favorites"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Failed to remove",
        message: err instanceof Error ? err.message : "An error occurred",
        color: "red",
      });
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const trackFavorites = favorites?.filter((f) => f.entityType === "track") ?? [];
  const artistFavorites = favorites?.filter((f) => f.entityType === "artist") ?? [];
  const albumFavorites = favorites?.filter((f) => f.entityType === "album") ?? [];

  if (!favorites || favorites.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="No favorites yet"
          description="Favorite songs, artists, and albums to see them here."
        />
      </MusicContainer>
    );
  }

  const renderFavoriteItem = (fav: Favorite, delay: number) => (
    <motion.div
      key={fav.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.03 }}
      className="group relative"
    >
      <Link href={`/music/${fav.entityType === "track" ? "song" : fav.entityType === "artist" ? "artists" : "albums"}/${fav.entityId}`}>
        <MusicCard
          title={fav.entityName ?? fav.entityId}
          subtitle={fav.entityType === "track" ? "Song" : fav.entityType === "artist" ? "Artist" : "Album"}
          imageUrl={fav.imageUrl}
          aspectRatio={fav.entityType === "artist" ? "square" : "portrait"}
        />
      </Link>
      <button
        onClick={() => removeFavoriteMutation.mutate({ entityType: fav.entityType, entityId: fav.entityId })}
        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <IconTrash size={14} />
      </button>
    </motion.div>
  );

  return (
    <MusicContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Favorites
        </h1>
        <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
          {favorites.length} favorited item{favorites.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-10">
        {trackFavorites.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <IconHeartFilled size={18} className="text-pink-400" />
              <SectionHeading title={`Songs (${trackFavorites.length})`} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {trackFavorites.map((fav, i) => renderFavoriteItem(fav, i))}
            </div>
          </section>
        )}

        {artistFavorites.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <IconHeartFilled size={18} className="text-pink-400" />
              <SectionHeading title={`Artists (${artistFavorites.length})`} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {artistFavorites.map((fav, i) => renderFavoriteItem(fav, i))}
            </div>
          </section>
        )}

        {albumFavorites.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <IconHeartFilled size={18} className="text-pink-400" />
              <SectionHeading title={`Albums (${albumFavorites.length})`} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {albumFavorites.map((fav, i) => renderFavoriteItem(fav, i))}
            </div>
          </section>
        )}
      </div>
    </MusicContainer>
  );
}
