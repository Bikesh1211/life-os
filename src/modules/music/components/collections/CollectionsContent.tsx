"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { IconFolder, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

type Collection = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  isSmart: boolean;
};

export function CollectionsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["music-collections"],
    queryFn: async () => {
      const res = await fetch("/api/music/collections");
      if (!res.ok) throw new Error("Failed to load collections");
      return res.json() as Promise<{ collections: Collection[] }>;
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const collections = data?.collections ?? [];

  if (collections.length === 0) {
    return (
      <MusicContainer>
        <MusicEmptyState
          title="No collections yet"
          description="Create a collection to group your favorite albums, artists, and tracks. Like playlists, but for your whole music life."
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
          Collections
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          {collections.length} collections
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/music/collections/${collection.id}`}>
              <div className="group rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-5 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--mantine-color-body,#0a0a0f)]">
                    <IconFolder size={20} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                      {collection.title}
                    </h3>
                    {collection.isSmart && (
                      <span className="text-xs text-blue-400">Smart collection</span>
                    )}
                  </div>
                </div>
                {collection.description && (
                  <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {collection.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                  {collection.itemCount} items
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </MusicContainer>
  );
}
