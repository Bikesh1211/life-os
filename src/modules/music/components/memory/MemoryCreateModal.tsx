"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, TextInput, Textarea, Group, Button, Loader, Popover } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconSearch, IconX, IconMusic, IconMicrophone, IconBooks } from "@tabler/icons-react";

const moods = ["🎵", "🎶", "❤️", "💔", "🔥", "🌟", "😊", "😢", "🤔", "💭", "✨", "🌙"];

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  type: "track" | "album" | "artist";
};

type SelectedTrack = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  type: "track" | "album" | "artist";
};

type MemoryFormData = {
  title: string;
  context: string;
  mood: string | null;
  memoryDate: string;
  location: string;
  trackId?: string;
};

type MemoryCreateModalProps = {
  opened: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    title?: string;
    context?: string;
    mood?: string | null;
    memoryDate?: string;
    location?: string;
    trackId?: string;
  };
};

export function MemoryCreateModal({ opened, onClose, initialData }: MemoryCreateModalProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (opened) {
      setTitle(initialData?.title ?? "");
      setContext(initialData?.context ?? "");
      setMood(initialData?.mood ?? null);
      setMemoryDate(initialData?.memoryDate ?? new Date().toISOString().split("T")[0]);
      setLocation(initialData?.location ?? "");
      setSelectedTrack(null);
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
    }
  }, [opened, initialData]);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      const allResults: SearchResult[] = [
        ...(data.artists ?? []).map((r: any) => ({ ...r, type: "artist" as const })),
        ...(data.albums ?? []).map((r: any) => ({ ...r, type: "album" as const })),
        ...(data.tracks ?? []).map((r: any) => ({ ...r, type: "track" as const })),
      ];
      setSearchResults(allResults);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelectTrack = (result: SearchResult) => {
    setSelectedTrack({
      id: result.id,
      title: result.title,
      artist: result.subtitle,
      imageUrl: result.imageUrl,
      type: result.type,
    });
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClearTrack = () => {
    setSelectedTrack(null);
  };

  const mutation = useMutation({
    mutationFn: async (data: MemoryFormData) => {
      const url = isEditing ? `/api/music/memories/${initialData!.id}` : "/api/music/memories";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save memory");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-memories"] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    mutation.mutate({
      title: title.trim(),
      context: context.trim(),
      mood,
      memoryDate: memoryDate || new Date().toISOString().split("T")[0],
      location: location.trim(),
      trackId: selectedTrack?.id || undefined,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Memory" : "New Memory"}
      size="lg"
      styles={{
        body: { background: "var(--mantine-color-body)" },
        header: { background: "var(--mantine-color-body)" },
      }}
    >
      <div className="space-y-4">
        <TextInput
          label="Title"
          placeholder="What do you want to remember?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Context"
          placeholder="Describe this memory..."
          value={context}
          onChange={(e) => setContext(e.currentTarget.value)}
          minRows={3}
          autosize
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--mantine-color-dimmed,#5c5f66)]">
            Mood
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m === mood ? null : m)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                  m === mood
                    ? "scale-110 bg-[var(--mantine-color-blue-6,#339af0)] ring-2 ring-[var(--mantine-color-blue-4,#74c0fc)]"
                    : "bg-[var(--mantine-color-dark-6,#1a1b1e)] hover:bg-[var(--mantine-color-dark-5,#25262b)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <TextInput
          label="Date"
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.currentTarget.value)}
        />

        <TextInput
          label="Location"
          placeholder="Where were you?"
          value={location}
          onChange={(e) => setLocation(e.currentTarget.value)}
        />

        <div className="relative">
          <label className="mb-1.5 block text-sm font-medium text-[var(--mantine-color-dimmed,#5c5f66)]">
            Linked Track
          </label>

          {selectedTrack ? (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-dark-6,#1a1b1e)] p-3">
              {selectedTrack.imageUrl ? (
                <img
                  src={selectedTrack.imageUrl}
                  alt={selectedTrack.title}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--mantine-color-dark-5,#25262b)]">
                  <IconMusic size={20} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                  {selectedTrack.title}
                </p>
                <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                  {selectedTrack.artist}
                </p>
              </div>
              <span className="rounded-md bg-[var(--mantine-color-dark-5,#25262b)] px-2 py-0.5 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                {selectedTrack.type}
              </span>
              <button
                onClick={handleClearTrack}
                className="rounded-full p-1 text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:bg-[var(--mantine-color-dark-4,#2e2f33)] hover:text-white"
              >
                <IconX size={16} />
              </button>
            </div>
          ) : (
            <Popover
              opened={showResults && searchResults.length > 0}
              onClose={() => setShowResults(false)}
              width="target"
              position="bottom"
              withinPortal
              zIndex={1000}
            >
              <Popover.Target>
                <TextInput
                  placeholder="Search songs, albums, artists..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.currentTarget.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  leftSection={<IconSearch size={16} />}
                  rightSection={searching ? <Loader size="xs" /> : null}
                />
              </Popover.Target>
              <Popover.Dropdown
                style={{ padding: 0, border: "1px solid var(--mantine-color-dark-4)" }}
              >
                <div className="max-h-72 w-full overflow-y-auto">
                  {(["artist", "album", "track"] as const).map((type) => {
                    const group = searchResults.filter((r) => r.type === type);
                    if (group.length === 0) return null;
                    return (
                      <div key={type}>
                        <div className="sticky top-0 bg-[var(--mantine-color-dark-6,#1a1b1e)] px-3 py-1.5 text-xs font-semibold tracking-wider text-[var(--mantine-color-dimmed,#5c5f66)] uppercase">
                          {type === "artist" ? "Artists" : type === "album" ? "Albums" : "Songs"}
                        </div>
                        {group.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelectTrack(result)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--mantine-color-dark-5,#25262b)]"
                          >
                            {result.imageUrl ? (
                              <img
                                src={result.imageUrl}
                                alt={result.title}
                                className="h-10 w-10 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--mantine-color-dark-5,#25262b)]">
                                {type === "artist" ? (
                                  <IconMicrophone
                                    size={18}
                                    className="text-[var(--mantine-color-dimmed,#5c5f66)]"
                                  />
                                ) : type === "album" ? (
                                  <IconBooks
                                    size={18}
                                    className="text-[var(--mantine-color-dimmed,#5c5f66)]"
                                  />
                                ) : (
                                  <IconMusic
                                    size={18}
                                    className="text-[var(--mantine-color-dimmed,#5c5f66)]"
                                  />
                                )}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[var(--mantine-color-text,#c1c2c5)]">
                                {result.title}
                              </p>
                              <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
                                {result.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </Popover.Dropdown>
            </Popover>
          )}
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} c="dimmed">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={!title.trim()}
            bg="var(--mantine-color-blue-6)"
          >
            {isEditing ? "Update" : "Save Memory"}
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
