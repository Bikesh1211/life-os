"use client";

import { Text, Group, Badge, ActionIcon } from "@mantine/core";
import {
  IconPinFilled,
  IconClock,
} from "@tabler/icons-react";
import type { Note } from "@/modules/notes";
import { useNotesStore } from "@/stores/notes-store";

const NOTE_COLORS: Record<string, string> = {
  red: "#f28b82",
  orange: "#fbbc04",
  yellow: "#fff475",
  green: "#ccff90",
  teal: "#a7ffeb",
  blue: "#cbf0f8",
  darkblue: "#aecbfa",
  purple: "#d7aefb",
  pink: "#fdcfe8",
  brown: "#e6c9a8",
  gray: "#e8eaed",
};

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]*)\]\([^\)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/[-*]\s/g, "")
    .replace(/\[x\]\s/gi, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function getColorBg(color: string | null | undefined): string {
  if (!color) return "";
  const hex = NOTE_COLORS[color];
  if (!hex) return "";
  return hex;
}

function getColorPin(color: string | null | undefined): string {
  if (!color) return "text-amber-500";
  return "text-gray-600";
}

type NoteCardProps = {
  note: Note;
};

export function NoteCard({ note }: NoteCardProps) {
  const openEditModal = useNotesStore((s) => s.openEditModal);
  const bg = getColorBg(note.color);
  const preview = stripMarkdown(note.content ?? "");
  const firstLines = preview.length > 200 ? preview.slice(0, 200) + "..." : preview;

  return (
    <div
      className="break-inside-avoid mb-4 cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] transition-all hover:shadow-md"
      style={{ backgroundColor: bg || "var(--surface-card)" }}
      onClick={() => openEditModal(note)}
    >
      <div className="p-4">
        {/* Pin + title */}
        <Group justify="space-between" wrap="nowrap" mb={4}>
          <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1, minWidth: 0 }}>
            {note.title}
          </Text>
          {note.isPinned && <IconPinFilled size={14} className={`shrink-0 ${getColorPin(note.color)}`} />}
        </Group>

        {/* Content */}
        {firstLines && (
          <Text
            size="xs"
            c={note.color ? "dimmed" : undefined}
            className={note.color ? "text-gray-700" : ""}
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
          >
            {firstLines}
          </Text>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <Group gap={4} mt={8} wrap="wrap">
            {note.tags.map((tag) => (
              <Badge key={tag} size="xs" color="gray" variant="light" className="uppercase tracking-wide text-[10px]">
                {tag}
              </Badge>
            ))}
          </Group>
        )}

        {/* Footer */}
        <Group justify="space-between" mt={8}>
          <Group gap={4}>
            <IconClock size={10} className="text-gray-400" />
            <Text size="xs" c="dimmed">{timeAgo(note.updatedAt)}</Text>
          </Group>
          <Group gap={4}>
            {note.reminderDate && (
              <Badge size="xs" color="blue" variant="dot">Rem</Badge>
            )}
            {note.category && note.category !== "personal" && (
              <Badge size="xs" variant="light" color="gray" className="capitalize">{note.category}</Badge>
            )}
          </Group>
        </Group>
      </div>
    </div>
  );
}
