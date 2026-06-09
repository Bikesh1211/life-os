"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { AudioPreview } from "../design-system/AudioPreview";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconClock, IconExternalLink, IconMicrophone } from "@tabler/icons-react";

type TrackData = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumTitle: string | null;
  albumCoverUrl: string | null;
  duration: number | null;
  trackNumber: number | null;
  discNumber: number | null;
  explicit: boolean;
  genre: string | null;
  releaseDate: string | null;
  previewUrl: string | null;
  trackViewUrl: string | null;
  albumViewUrl: string | null;
  artistViewUrl: string | null;
  isStreamable: boolean | null;
  rating: number | null;
  isFavorited: boolean;
  journalEntries: Array<{ id: string; mood: string | null; journalEntry: string; createdAt: string }>;
  memories: Array<{ id: string; contextText: string; linkedEventId: string | null; createdAt: string }>;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
        subtitle={data.artistName}
      >
        <div className="flex flex-wrap items-center gap-3">
          {data.previewUrl && <AudioPreview previewUrl={data.previewUrl} />}

          {data.explicit && (
            <div className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              E
            </div>
          )}

          {data.genre && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              {data.genre}
            </div>
          )}

          <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {formatDuration(data.duration)}
          </div>

          {data.discNumber && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              Disc {data.discNumber}
              {data.trackNumber && <> · Track {data.trackNumber}</>}
            </div>
          )}

          {data.releaseDate && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              {data.releaseDate.slice(0, 10)}
            </div>
          )}

          {data.rating && (
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
              ★ {data.rating}/10
            </div>
          )}

          {data.albumViewUrl && (
            <Link
              href={data.albumViewUrl}
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
        {data.albumTitle && (
          <Link
            href={`/music/albums/${data.albumId}`}
            className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4 transition-colors hover:bg-[var(--mantine-color-dark-5,#25262b)]"
          >
            {data.albumCoverUrl && (
              <img
                src={data.albumCoverUrl}
                alt={data.albumTitle}
                className="h-14 w-14 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">From the album</p>
              <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)]">{data.albumTitle}</p>
            </div>
          </Link>
        )}

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