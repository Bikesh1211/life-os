"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconMapPin,
  IconMoodHappy,
  IconPhoto,
  IconMusic,
} from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

type MemoryData = {
  id: string;
  userId: string;
  title: string | null;
  contextText: string;
  mood: string | null;
  photoUrls: string[];
  memoryDate: string | null;
  location: string | null;
  linkedEventId: string | null;
  createdAt: string;
  songs: Array<{
    trackId: string;
    trackName: string | null;
    trackImageUrl: string | null;
  }>;
};

export function MemoryDetailContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);

  const { data: memory, isLoading } = useQuery<MemoryData>({
    queryKey: ["memory", id],
    queryFn: () => apiFetch<MemoryData>(`/api/music/memories/${id}`),
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="h-48 animate-pulse rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]"
            />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (!memory) {
    return (
      <MusicContainer>
        <MusicEmptyState title="Memory not found" description="This memory doesn't exist." />
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <Link
        href="/music/memories"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-[var(--mantine-color-text,#c1c2c5)]"
      >
        <IconArrowLeft size={16} />
        Back to Memories
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">
          {memory.title || "Untitled Memory"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--mantine-color-dimmed,#5c5f66)]">
          {memory.contextText}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {memory.mood && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
              <IconMoodHappy size={14} />
              {memory.mood}
            </div>
          )}
          {memory.memoryDate && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
              <IconClock size={14} />
              {new Date(memory.memoryDate).toLocaleDateString()}
            </div>
          )}
          {memory.location && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
              <IconMapPin size={14} />
              {memory.location}
            </div>
          )}
        </div>
      </div>

      {memory.photoUrls.length > 0 && (
        <div className="mb-8">
          <SectionHeading title="Photos" />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {memory.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Memory photo ${i + 1}`}
                className="h-32 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {memory.songs.length > 0 && (
        <div className="mb-8">
          <SectionHeading title="Linked Songs" />
          <div className="mt-3 space-y-2">
            {memory.songs.map((song, i) => (
              <motion.div
                key={song.trackId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/music/song/${song.trackId}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 transition-all hover:shadow-md"
                >
                  {song.trackImageUrl ? (
                    <img
                      src={song.trackImageUrl}
                      alt={song.trackName ?? "Track"}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--mantine-color-dark-5,#25262b)]">
                      <IconMusic size={20} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                      {song.trackName ?? "Unknown Track"}
                    </p>
                    <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                      View track details
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </MusicContainer>
  );
}
