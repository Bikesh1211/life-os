"use client";

import { motion } from "framer-motion";
import { IconMusic, IconHeart, IconCalendar, IconMapPin } from "@tabler/icons-react";

type MemoryCardProps = {
  id: string;
  title: string;
  context: string;
  mood: string | null;
  photoUrls: string[];
  memoryDate: string | null;
  location: string | null;
  trackName: string | null;
  artistName: string | null;
  linkedEventTitle: string | null;
  delay?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function MemoryCard({
  id,
  title,
  context,
  mood,
  photoUrls,
  memoryDate,
  location,
  trackName,
  artistName,
  linkedEventTitle,
  delay = 0,
  onEdit,
  onDelete,
}: MemoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="group overflow-hidden rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-body,#0a0a0f)] transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]"
    >
      {photoUrls.length > 0 && (
        <div className={`grid gap-0.5 ${photoUrls.length === 1 ? "" : photoUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {photoUrls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="aspect-video overflow-hidden"
              style={photoUrls.length === 1 ? {} : i === 0 && photoUrls.length === 3 ? { gridRow: "span 2" } : {}}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
          {photoUrls.length > 3 && (
            <div className="flex aspect-video items-center justify-center bg-[var(--mantine-color-dark-6,#1a1b1e)] text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
              +{photoUrls.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            {title}
          </h3>
          {mood && (
            <span className="shrink-0 text-lg" title={mood}>
              {mood}
            </span>
          )}
        </div>

        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-[var(--mantine-color-dimmed,#5c5f66)]">
          {context}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
          {trackName && (
            <span className="flex items-center gap-1">
              <IconMusic size={12} />
              {trackName}{artistName ? ` · ${artistName}` : ""}
            </span>
          )}
          {memoryDate && (
            <span className="flex items-center gap-1">
              <IconCalendar size={12} />
              {new Date(memoryDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <IconMapPin size={12} />
              {location}
            </span>
          )}
          {linkedEventTitle && (
            <span className="flex items-center gap-1">
              <IconHeart size={12} />
              {linkedEventTitle}
            </span>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="mt-3 flex gap-2 border-t border-[var(--mantine-color-dark-4,#2e2f33)] pt-3 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="text-xs text-red-400 transition-colors hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
