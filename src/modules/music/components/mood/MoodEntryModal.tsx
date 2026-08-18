"use client";

import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { Modal, Button, Group, Text } from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/http";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Energetic" },
  { emoji: "🌊", label: "Calm" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🎉", label: "Excited" },
  { emoji: "💭", label: "Nostalgic" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "🎯", label: "Focused" },
  { emoji: "😴", label: "Tired" },
];

type MoodEntryModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function MoodEntryModal({ opened, onClose }: MoodEntryModalProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { mood: string; note?: string }) =>
      apiFetch("/api/music/mood", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      notifications.show({ title: "Logged", message: "Mood logged", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["music-mood"] });
      setSelectedMood(null);
      setNote("");
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) return;
    mutation.mutate({ mood: selectedMood, note: note.trim() || undefined });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="How does the music make you feel?"
      size="md"
      styles={{
        body: { background: "var(--mantine-color-body)" },
        header: { background: "var(--mantine-color-body)" },
      }}
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--mantine-color-dimmed,#5c5f66)]">
            Select your mood
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedMood(m.label.toLowerCase())}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                  selectedMood === m.label.toLowerCase()
                    ? "bg-[var(--mantine-color-blue-6,#339af0)] ring-2 ring-[var(--mantine-color-blue-4,#74c0fc)]"
                    : "bg-[var(--mantine-color-dark-6,#1a1b1e)] hover:bg-[var(--mantine-color-dark-5,#25262b)]"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] text-[var(--mantine-color-text,#c1c2c5)]">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Text size="sm" fw={500}>Note (optional)</Text>
        <Editor
          content={textToEditorContent(note)}
          onChange={(_json, _html, text) => setNote(text)}
          placeholder="What are you listening to?"
          minHeight="80px"
          showToolbar={false}
        />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} c="dimmed">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={!selectedMood}
            bg="var(--mantine-color-blue-6)"
          >
            Log Mood
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
