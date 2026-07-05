"use client";

import { useState, useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { Modal, TextInput, Group, Button, Text, Loader } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memory?: any;
};

type SearchResult = {
  id: number;
  title: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  year: string;
};

const moodOptions = [
  { value: "amazing", label: "😁 Amazing" },
  { value: "loved_it", label: "😍 Loved It" },
  { value: "emotional", label: "🥹 Emotional" },
  { value: "mind_blowing", label: "🤯 Mind Blowing" },
  { value: "funny", label: "😂 Funny" },
  { value: "scary", label: "😱 Scary" },
  { value: "boring", label: "😴 Boring" },
  { value: "personal_story", label: "✍️ Personal Story" },
];

function parseMediaId(mediaId: string): SearchResult | null {
  if (!mediaId) return null;
  const idx = mediaId.lastIndexOf("-");
  if (idx === -1) return null;
  const mediaType = mediaId.slice(0, idx) as "movie" | "tv";
  const id = Number(mediaId.slice(idx + 1));
  if (isNaN(id)) return null;
  return { id, title: "", mediaType, posterPath: null, year: "" };
}

export function MemoryCreateModal({ opened, onClose, onSuccess, memory }: Props) {
  const isEditing = !!memory;
  const [title, setTitle] = useState(memory?.title ?? "");
  const [context, setContext] = useState(memory?.contextText ?? "");
  const [mood, setMood] = useState<string | null>(memory?.mood ?? null);
  const [watchDate, setWatchDate] = useState(memory?.watchDate ? new Date(memory.watchDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState(memory?.location ?? "");
  const [watchedWith, setWatchedWith] = useState(memory?.watchedWith ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SearchResult | null>(() => parseMediaId(memory?.mediaId));
  const searchRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!opened) return;
    if (memory) {
      setTitle(memory.title ?? "");
      setContext(memory.contextText ?? "");
      setMood(memory.mood ?? null);
      setWatchDate(memory.watchDate ? new Date(memory.watchDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
      setLocation(memory.location ?? "");
      setWatchedWith(memory.watchedWith ?? "");
      setSelectedMedia(parseMediaId(memory.mediaId));
    }
  }, [opened, memory]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          const results = (json.media ?? []).slice(0, 5).map((m: any) => ({
            id: Number(m.tmdbId),
            title: m.title ?? "",
            mediaType: m.mediaType as "movie" | "tv",
            posterPath: m.posterPath,
            year: m.releaseDate ? new Date(m.releaseDate).getFullYear().toString() : "",
          }));
          setSearchResults(results);
        }
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [searchQuery]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/movies/memories/${memory.id}` : "/api/movies/memories";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: isEditing ? "Updated" : "Created", message: isEditing ? "Memory updated" : "Memory created", color: "green" });
      onSuccess();
      onClose();
      if (!isEditing) {
        setTitle(""); setContext(""); setMood(null); setLocation(""); setWatchedWith(""); setSelectedMedia(null); setSearchQuery(""); setSearchResults([]);
      }
    },
  });

  const handleSubmit = () => {
    if (!context.trim()) return;
    mutation.mutate({
      title: title.trim() || null,
      contextText: context.trim(),
      mood,
      watchDate: watchDate || undefined,
      location: location.trim() || undefined,
      watchedWith: watchedWith.trim() || undefined,
      mediaId: selectedMedia ? `${selectedMedia.mediaType}-${selectedMedia.id}` : memory?.mediaId ?? undefined,
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Memory" : "New Memory"} size="lg">
      <div className="space-y-4">
        <TextInput label="Title" placeholder="Movie night with friends?" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />

        <div>
          <Text size="sm" fw={500} mb={4}>Link to Movie / TV Show <Text span c="dimmed" size="xs">(optional)</Text></Text>
          <TextInput
            placeholder="Search movies and TV shows..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.currentTarget.value); setSelectedMedia(null); }}
            rightSection={searching ? <Loader size="xs" /> : null}
          />
          {searchResults.length > 0 && !selectedMedia && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--mantine-color-dark-6)] p-1">
              {searchResults.map((r) => (
                <button
                  key={`${r.mediaType}-${r.id}`}
                  onClick={() => { setSelectedMedia(r); setSearchResults([]); setSearchQuery(""); }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--mantine-color-dark-5)]"
                >
                  {r.posterPath ? (
                    <img src={`${TMDB_IMAGE_BASE_URL}/w92${r.posterPath}`} alt="" className="h-10 w-7 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-7 items-center justify-center rounded bg-[var(--mantine-color-dark-4)] text-xs">🎬</div>
                  )}
                  <div className="flex-1 truncate">
                    <Text size="sm" c="white" lineClamp={1}>{r.title}</Text>
                    <Text size="xs" c="dimmed">{r.year} · {r.mediaType === "movie" ? "Movie" : "TV"}</Text>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedMedia && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              {selectedMedia.posterPath ? (
                <img src={`${TMDB_IMAGE_BASE_URL}/w92${selectedMedia.posterPath}`} alt="" className="h-12 w-8 rounded object-cover" />
              ) : (
                <div className="flex h-12 w-8 items-center justify-center rounded bg-[var(--mantine-color-dark-4)] text-xs">🎬</div>
              )}
              <div className="flex-1">
                <Text size="sm" c="white" fw={500} lineClamp={1}>{selectedMedia.title}</Text>
                <Text size="xs" c="dimmed">{selectedMedia.year} · {selectedMedia.mediaType === "movie" ? "Movie" : "TV"}</Text>
              </div>
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setSelectedMedia(null)}>Remove</Button>
            </div>
          )}
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>Context</Text>
          <textarea
            value={context}
            onChange={(e) => setContext(e.currentTarget.value)}
            placeholder="Describe this memory..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--mantine-color-dark-6)] p-3 text-sm text-[var(--mantine-color-text)] placeholder-[var(--mantine-color-dimmed)] outline-none"
            rows={4}
          />
        </div>
        <div>
          <Text size="sm" fw={500} mb={4}>Mood</Text>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value === mood ? null : m.value)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                  m.value === mood
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--mantine-color-dark-6)] text-[var(--mantine-color-dimmed)] hover:bg-[var(--mantine-color-dark-5)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <TextInput label="Watch Date" type="date" value={watchDate} onChange={(e) => setWatchDate(e.currentTarget.value)} />
        <TextInput label="Location" placeholder="Where did you watch it?" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
        <TextInput label="Watched With" placeholder="Friends, family, alone..." value={watchedWith} onChange={(e) => setWatchedWith(e.currentTarget.value)} />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={mutation.isPending} disabled={!context.trim()}>Save Memory</Button>
        </Group>
      </div>
    </Modal>
  );
}
