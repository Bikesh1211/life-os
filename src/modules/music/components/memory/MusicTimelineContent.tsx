"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { MemoryTimeline } from "./MemoryTimeline";
import { MemoryCreateModal } from "./MemoryCreateModal";
import { MemoryRewind } from "./MemoryRewind";
import { IconPlus } from "@tabler/icons-react";

export function MusicTimelineContent() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["music-memories"],
    queryFn: async () => {
      const res = await fetch("/api/music/memories?limit=200");
      if (!res.ok) throw new Error("Failed to load");
      return res.json() as Promise<any[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/music/memories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["music-memories"] }),
  });

  const memories = data ?? [];
  const editingMemory = editingId ? memories.find((m) => m.id === editingId) : undefined;

  const timelineEntries = memories.map((m: any) => ({
    id: m.id,
    title: m.title,
    context: m.context,
    mood: m.mood ?? null,
    memoryDate: m.memoryDate ?? null,
    trackName: m.trackName ?? null,
    artistName: m.artistName ?? null,
    createdAt: m.createdAt,
  }));

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Music Memories
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
            Your personal music memories through time
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <IconPlus size={16} />
          New memory
        </button>
      </motion.div>

      <div className="mb-8">
        <MemoryRewind />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <MusicEmptyState
          icon="💭"
          title="No memories yet"
          description="Start capturing memories of the music that matters to you."
          action={{ label: "Create memory", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <MemoryTimeline
          entries={timelineEntries}
          onEntryClick={(id) => {
            setEditingId(id);
            setShowCreate(true);
          }}
        />
      )}

      <MemoryCreateModal
        opened={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditingId(null);
        }}
        initialData={
          editingMemory
            ? {
                id: editingMemory.id,
                title: editingMemory.title ?? "",
                context: editingMemory.context ?? "",
                mood: editingMemory.mood ?? null,
                memoryDate: editingMemory.memoryDate?.split("T")[0] ?? "",
                location: editingMemory.location ?? "",
                trackName: editingMemory.trackName ?? "",
                artistName: editingMemory.artistName ?? "",
              }
            : undefined
        }
      />
    </MusicContainer>
  );
}
