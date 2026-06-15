"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { MemoryCard } from "./MemoryCard";
import { MemoryCreateModal } from "./MemoryCreateModal";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

type MemoryTrack = {
  trackId: string;
  trackName: string | null;
  artistName: string | null;
  trackImageUrl: string | null;
};

type Memory = {
  id: string;
  title: string | null;
  contextText: string;
  mood: string | null;
  photoUrls: string[];
  memoryDate: string | null;
  location: string | null;
  createdAt: string;
  track: MemoryTrack | null;
};

export function MemoriesContent() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["music-memories"],
    queryFn: async () => {
      const res = await fetch("/api/music/memories");
      if (!res.ok) throw new Error("Failed to load memories");
      return res.json() as Promise<Memory[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/music/memories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete memory");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-memories"] });
    },
    onError: (err) => {
      notifications.show({
        title: "Failed to delete",
        message: err instanceof Error ? err.message : "An error occurred",
        color: "red",
      });
    },
  });

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  const memories = data ?? [];

  return (
    <MusicContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Memories
          </h1>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            {memories.length} memory{memories.length !== 1 ? "ies" : ""} connected to music
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
        >
          <IconPlus size={18} />
          New Memory
        </button>
      </div>

      {memories.length === 0 ? (
        <MusicEmptyState
          title="No memories yet"
          description="Create a memory and link it to a song to start building your personal music story."
          action={{ label: "Create memory", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-4">
          {memories.map((memory, i) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <MemoryCard
                id={memory.id}
                title={memory.title ?? ""}
                context={memory.contextText}
                mood={memory.mood}
                photoUrls={memory.photoUrls}
                memoryDate={memory.memoryDate}
                location={memory.location}
                trackName={memory.track?.trackName ?? null}
                artistName={memory.track?.artistName ?? null}
                trackImageUrl={memory.track?.trackImageUrl ?? null}
                linkedEventTitle={null}
                onDelete={() => deleteMutation.mutate(memory.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {showCreate && (
        <MemoryCreateModal
          opened={showCreate}
          onClose={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["music-memories"] });
          }}
        />
      )}
    </MusicContainer>
  );
}
