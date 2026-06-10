"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Select } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const moods = ["🎵", "🎶", "❤️", "💔", "🔥", "🌟", "😊", "😢", "🤔", "💭", "✨", "🌙"];

type MemoryFormData = {
  title: string;
  context: string;
  mood: string | null;
  memoryDate: string;
  location: string;
  trackName: string;
  artistName: string;
};

type MemoryCreateModalProps = {
  opened: boolean;
  onClose: () => void;
  initialData?: MemoryFormData & { id?: string };
};

export function MemoryCreateModal({ opened, onClose, initialData }: MemoryCreateModalProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const queryClient = useQueryClient();

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (opened) {
      setTitle(initialData?.title ?? "");
      setContext(initialData?.context ?? "");
      setMood(initialData?.mood ?? null);
      setMemoryDate(initialData?.memoryDate ?? new Date().toISOString().split("T")[0]);
      setLocation(initialData?.location ?? "");
      setTrackName(initialData?.trackName ?? "");
      setArtistName(initialData?.artistName ?? "");
    }
  }, [opened, initialData]);

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
      trackName: trackName.trim(),
      artistName: artistName.trim(),
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

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Track"
            placeholder="Song name"
            value={trackName}
            onChange={(e) => setTrackName(e.currentTarget.value)}
          />
          <TextInput
            label="Artist"
            placeholder="Artist name"
            value={artistName}
            onChange={(e) => setArtistName(e.currentTarget.value)}
          />
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
