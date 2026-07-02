"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../design-system/SectionHeading";
import { IconClock } from "@tabler/icons-react";

type Memory = {
  id: string;
  year: number;
  trackName?: string;
  artistName?: string;
  contextText: string;
};

export function MusicMemories({ memories }: { memories?: Memory[] }) {
  if (!memories || memories.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Music Memories" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
              <IconClock size={12} />
              {memory.year} years ago
            </div>
            {memory.trackName && (
              <p className="text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
                {memory.trackName}
                {memory.artistName && (
                  <span className="text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {" "}· {memory.artistName}
                  </span>
                )}
              </p>
            )}
            <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
              {memory.contextText}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
