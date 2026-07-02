"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MusicContainer } from "../design-system/MusicContainer";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";

type JournalEntry = {
  id: string;
  mood: string | null;
  journalEntry: string;
  trackName: string | null;
  artistName: string | null;
  createdAt: string;
};

export function JournalContent() {
  const [showForm, setShowForm] = useState(false);
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["music-journal"],
    queryFn: async () => {
      const res = await fetch("/api/music/journal?limit=30");
      if (!res.ok) throw new Error("Failed to load journal");
      return res.json() as Promise<{ entries: JournalEntry[] }>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (params: { journalEntry: string; mood?: string }) => {
      const res = await fetch("/api/music/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Journal entry created", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["music-journal"] });
      setEntry("");
      setMood("");
      setShowForm(false);
    },
  });

  const entries = data?.entries ?? [];

  if (isLoading) {
    return (
      <MusicContainer>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </MusicContainer>
    );
  }

  return (
    <MusicContainer>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
            Music Journal
          </h1>
          <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
            Reflections on the music in your life
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <IconPlus size={16} />
          New entry
        </button>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
        >
          <Editor
            content={textToEditorContent(entry)}
            onChange={(_json, _html, text) => setEntry(text)}
            placeholder="What are you listening to? How does it make you feel?"
            minHeight="120px"
            showToolbar={false}
          />
          <div className="mt-3 flex items-center gap-3">
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Mood (optional)"
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none"
            />
            <button
              onClick={() => createMutation.mutate({ journalEntry: entry, mood: mood || undefined })}
              disabled={!entry.trim() || createMutation.isPending}
              className="ml-auto rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      )}

      {entries.length === 0 ? (
        <MusicEmptyState
          title="No journal entries yet"
          description="Write about the music you're listening to and how it makes you feel."
          action={{ label: "Write first entry", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                {entry.mood && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                    {entry.mood}
                  </span>
                )}
                {(entry.trackName || entry.artistName) && (
                  <span className="text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {entry.trackName}
                    {entry.artistName && <> · {entry.artistName}</>}
                  </span>
                )}
                <span className="ml-auto text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)]">{entry.journalEntry}</p>
            </motion.div>
          ))}
        </div>
      )}
    </MusicContainer>
  );
}
