"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { motion } from "framer-motion";
import { IconClock } from "@tabler/icons-react";

type TrackData = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumTitle: string | null;
  albumCoverUrl: string | null;
  duration: number | null;
  journalEntries: Array<{ id: string; mood: string | null; journalEntry: string; createdAt: string }>;
  memories: Array<{ id: string; contextText: string; linkedEventId: string | null; createdAt: string }>;
};

export function TrackContent({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = use(idPromise);
  const { data, isLoading } = useQuery<TrackData>({
    queryKey: ["track", id],
    queryFn: async () => {
      const res = await fetch(`/api/music/tracks/${id}`);
      if (!res.ok) throw new Error("Track not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="h-48 animate-pulse rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  if (!data) {
    return (
      <MusicContainer>
        <MusicEmptyState title="Track not found" description="This track doesn't exist in your library." />
      </MusicContainer>
    );
  }

  return (
    <>
      <GradientHero
        imageUrl={data.albumCoverUrl}
        title={data.title}
        subtitle={`${data.artistName}${data.albumTitle ? ` · ${data.albumTitle}` : ""}`}
        compact
      />

      <MusicContainer>
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeading title="Journal Entries" />
            {data.journalEntries.length === 0 ? (
              <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No journal entries yet.</p>
            ) : (
              <div className="space-y-3">
                {data.journalEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4"
                  >
                    {entry.mood && (
                      <span className="mb-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                        {entry.mood}
                      </span>
                    )}
                    <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)]">{entry.journalEntry}</p>
                    <p className="mt-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading title="Life Moments Connected" />
            {data.memories.length === 0 ? (
              <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No memories connected yet.</p>
            ) : (
              <div className="space-y-3">
                {data.memories.map((memory, i) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                      <IconClock size={12} />
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)]">{memory.contextText}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </MusicContainer>
    </>
  );
}
