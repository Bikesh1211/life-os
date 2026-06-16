"use client";

import { Card, Text, Group, Badge, ActionIcon, Menu, Stack, Image } from "@mantine/core";
import {
  IconPin,
  IconPinFilled,
  IconArchive,
  IconArchiveOff,
  IconTrash,
  IconDots,
  IconClock,
  IconStarFilled,
} from "@tabler/icons-react";
import type { Note } from "@/modules/notes";
import { useUpdateNote, useNoteTags } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";

const categoryColors: Record<string, string> = {
  personal: "grape",
  work: "blue",
  study: "teal",
  ideas: "yellow",
  journal: "pink",
};

const priorityColors: Record<string, string> = {
  low: "gray",
  medium: "blue",
  high: "red",
};

const statusColors: Record<string, string> = {
  draft: "gray",
  published: "green",
  archived: "orange",
};

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]*)\]\([^\)]*\)/g, "$1")
    .replace(/[-*]\s/g, "")
    .replace(/[-*]\s\[\s\]\s/g, "")
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

type NoteCardProps = {
  note: Note;
  onDeleteRequest?: (note: Note) => void;
};

export function NoteCard({ note, onDeleteRequest }: NoteCardProps) {
  const openEditNote = useNotesStore((s) => s.openEditNote);
  const updateNote = useUpdateNote();
  const { data: tagDefinitions } = useNoteTags();

  const tagColors = new Map((tagDefinitions ?? []).map((t) => [t.name, t.color]));
  const preview = stripMarkdown(note.excerpt ?? note.content ?? "");
  const truncated = preview.length > 150 ? preview.slice(0, 150) + "..." : preview;

  return (
    <Card
      withBorder
      padding="sm"
      className="group cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => openEditNote(note)}
    >
      <Stack gap={6}>
        {/* Cover Image */}
        {note.coverImage && (
          <div className="-mx-md -mt-md mb-2 overflow-hidden rounded-t-md">
            <Image
              src={note.coverImage}
              alt=""
              height={120}
              className="object-cover"
              fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23333' width='40' height='40'/%3E%3C/svg%3E"
            />
          </div>
        )}

        <Group justify="space-between" wrap="nowrap">
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            {note.isPinned && <IconStarFilled size={14} className="text-amber-500 shrink-0" />}
            <Text fw={600} lineClamp={1} style={{ flex: 1 }}>
              {note.title}
            </Text>
          </Group>
          <div onClick={(e) => e.stopPropagation()}>
          <Menu shadow="md" width={160} withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={note.isPinned ? <IconPin size={14} /> : <IconPinFilled size={14} />}
                onClick={() => updateNote.mutate({ id: note.id, isPinned: !note.isPinned })}
              >
                {note.isPinned ? "Unpin" : "Pin"}
              </Menu.Item>
              <Menu.Item
                leftSection={note.status === "archived" ? <IconArchiveOff size={14} /> : <IconArchive size={14} />}
                onClick={() => updateNote.mutate({ id: note.id, status: note.status === "archived" ? "published" : "archived" })}
              >
                {note.status === "archived" ? "Restore" : "Archive"}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDeleteRequest?.(note)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          </div>
        </Group>

        {truncated && (
          <Text size="xs" c="dimmed" lineClamp={3}>
            {truncated}
          </Text>
        )}

        <Group gap={2} wrap="wrap">
          <Badge size="xs" color={statusColors[note.status] ?? "gray"} variant="dot">
            {note.status}
          </Badge>
          <Badge
            size="xs"
            color={categoryColors[note.category] ?? "gray"}
            variant="light"
          >
            {note.category}
          </Badge>
          {note.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              size="xs"
              color={tagColors.get(tag) ?? "gray"}
              variant="outline"
            >
              {tag}
            </Badge>
          ))}
          {(note.tags?.length ?? 0) > 2 && (
            <Badge size="xs" color="gray" variant="outline">
              +{note.tags!.length - 2}
            </Badge>
          )}
        </Group>

        <Group gap="xs">
          <IconClock size={12} className="text-gray-400" />
          <Text size="xs" c="dimmed">
            {timeAgo(note.updatedAt)}
          </Text>
          <Badge size="xs" color={priorityColors[note.priority] ?? "gray"} variant="dot">
            {note.priority}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}
