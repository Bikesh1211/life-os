"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GradientHero } from "../design-system/GradientHero";
import { MusicContainer } from "../design-system/MusicContainer";
import { SectionHeading } from "../design-system/SectionHeading";
import { MusicEmptyState } from "../design-system/MusicEmptyState";
import { AudioPreview } from "../design-system/AudioPreview";
import { AddToCollectionButton } from "../design-system/AddToCollectionButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconClock, IconExternalLink, IconHeart, IconHeartFilled, IconMicrophone, IconNote } from "@tabler/icons-react";

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

  const queryClient = useQueryClient();
  const [favoriting, setFavoriting] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  const { data: notes } = useQuery({
    queryKey: ["track-notes", id],
    queryFn: async () => {
      const res = await fetch(`/api/music/notes?entityType=track&entityId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json() as Promise<Array<{ id: string; content: string; createdAt: string }>>;
    },
  });

  const noteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/music/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "track", entityId: id, content }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track-notes", id] });
      setNoteInput("");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/music/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track-notes", id] });
    },
  });

  const [savingNote, setSavingNote] = useState(false);

  const handleSaveNote = async () => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    noteMutation.mutate(noteInput.trim(), { onSettled: () => setSavingNote(false) });
  };

  const favoriteMutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      if (action === "add") {
        const res = await fetch("/api/music/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotifyId: id, entityType: "track" }),
        });
        if (!res.ok) throw new Error("Failed to favorite");
        return res.json();
      } else {
        const res = await fetch(`/api/music/favorites?entityType=track&entityId=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unfavorite");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["track", id] });
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

          <button
            onClick={() => {
              setFavoriting(true);
              if (data.isFavorited) {
                favoriteMutation.mutate("remove", {
                  onSettled: () => setFavoriting(false),
                });
              } else {
                favoriteMutation.mutate("add", {
                  onSettled: () => setFavoriting(false),
                });
              }
            }}
            disabled={favoriting}
            className="rounded-full px-3 py-1 text-sm backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            {data.isFavorited ? (
              <span className="flex items-center gap-1.5 text-pink-400">
                <IconHeartFilled size={16} />
                Favorited
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/80">
                <IconHeart size={16} />
                Favorite
              </span>
            )}
          </button>

          <AddToCollectionButton entityType="track" entityId={data.id} />

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

        <div className="mt-8">
          <SectionHeading title="Notes" />
          <div className="mb-4 flex gap-3">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Write a note about this track..."
              rows={2}
              className="flex-1 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3 text-sm text-[var(--mantine-color-text,#c1c2c5)] placeholder-[var(--mantine-color-dimmed,#5c5f66)] outline-none resize-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !noteInput.trim()}
              className="self-end rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {savingNote ? "Saving..." : "Save"}
            </button>
          </div>
          <div className="space-y-3">
            {notes?.length === 0 && (
              <p className="text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">No notes yet.</p>
            )}
            {notes?.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-4"
              >
                <IconNote size={16} className="mt-0.5 shrink-0 text-[var(--mantine-color-dimmed,#5c5f66)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--mantine-color-text,#c1c2c5)] whitespace-pre-wrap">{note.content}</p>
                  <p className="mt-1 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteNoteMutation.mutate(note.id)}
                  className="shrink-0 text-xs text-red-400 transition-colors hover:text-red-300"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </MusicContainer>
    </>
  );
}