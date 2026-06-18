"use client";

import { useState } from "react";
import { Modal, TextInput, Group, Button, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

type Props = {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export function MemoryCreateModal({ opened, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [watchDate, setWatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [watchedWith, setWatchedWith] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/movies/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      onSuccess();
      onClose();
      setTitle(""); setContext(""); setMood(null); setLocation(""); setWatchedWith("");
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
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="New Memory" size="lg">
      <div className="space-y-4">
        <TextInput label="Title" placeholder="Movie night with friends?" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        <div>
          <Text size="sm" fw={500} mb={4}>Context</Text>
          <textarea
            value={context}
            onChange={(e) => setContext(e.currentTarget.value)}
            placeholder="Describe this memory..."
            className="w-full rounded-lg border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-6)] p-3 text-sm text-[var(--mantine-color-text)] placeholder-[var(--mantine-color-dimmed)] outline-none"
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
