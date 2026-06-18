"use client";

import { motion } from "framer-motion";
import { Text, Group } from "@mantine/core";
import Link from "next/link";

type Props = {
  memory: any;
};

const moodLabels: Record<string, string> = {
  amazing: "😁", loved_it: "😍", emotional: "🥹", mind_blowing: "🤯",
  funny: "😂", scary: "😱", boring: "😴", personal_story: "✍️",
};

export function MemoryCard({ memory }: Props) {
  const moodEmoji = moodLabels[memory.mood?.toLowerCase()] ?? memory.mood ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-body)] transition-colors hover:border-[var(--mantine-color-dark-3)]"
    >
      <Link href={`/movies/memories/${memory.id}`} className="block no-underline">
        {memory.mediaPosterUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={memory.mediaPosterUrl}
              alt={memory.mediaTitle ?? ""}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        {!memory.mediaPosterUrl && (memory.photoUrls?.length > 0 || memory.screenshotUrls?.length > 0) && (
          <div className="aspect-video overflow-hidden">
            <img
              src={memory.photoUrls?.[0] ?? memory.screenshotUrls?.[0]}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <Text fw={600} c="white" size="sm" lineClamp={1}>
              {memory.title ?? "Untitled Memory"}
            </Text>
            {moodEmoji && <span className="shrink-0 text-lg">{moodEmoji}</span>}
          </div>
          <Text size="xs" c="dimmed" lineClamp={3} className="leading-relaxed">
            {memory.contextText}
          </Text>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--mantine-color-dimmed)]">
            {memory.watchDate && <span>{new Date(memory.watchDate).toLocaleDateString()}</span>}
            {memory.location && <span>📍 {memory.location}</span>}
            {memory.watchedWith && <span>👤 {memory.watchedWith}</span>}
          </div>
        </div>
      </Link>
      {memory.mediaId && memory.mediaTitle && (
        <div className="border-t border-[var(--mantine-color-dark-4)] px-4 py-2">
          <Link
            href={`/movies/media/${memory.mediaId}`}
            className="flex items-center gap-2 no-underline transition-colors hover:opacity-80"
          >
            {memory.mediaPosterUrl ? (
              <img
                src={memory.mediaPosterUrl}
                alt={memory.mediaTitle}
                className="h-8 w-8 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--mantine-color-dark-6)] text-xs">
                🎬
              </div>
            )}
            <Text size="xs" c="dimmed" lineClamp={1}>
              {memory.mediaTitle}
            </Text>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
