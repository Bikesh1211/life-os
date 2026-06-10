"use client";

import {
  Modal,
  Text,
  Group,
  Badge,
  Stack,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Divider,
  Button,
} from "@mantine/core";
import {
  IconPin,
  IconPinFilled,
  IconArchive,
  IconArchiveOff,
  IconTrash,
  IconClock,
  IconCalendar,
  IconPencil,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNoteTags, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";
import type { Note } from "@/modules/notes";

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

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type NoteViewModalProps = {
  note: Note | null;
  onClose: () => void;
};

export function NoteViewModal({ note, onClose }: NoteViewModalProps) {
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { data: tagDefinitions } = useNoteTags();
  const openEditNote = useNotesStore((s) => s.openEditNote);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const tagColors = new Map((tagDefinitions ?? []).map((t) => [t.name, t.color]));

  return (
    <Modal
      opened={!!note}
      onClose={onClose}
      size="lg"
      centered
      padding={0}
      withCloseButton={true}
      styles={{
        header: { position: "absolute", top: 8, right: 8, zIndex: 1, padding: 0, minHeight: 0 },
        close: { color: "var(--mantine-color-gray-5)", "&:hover": { color: "var(--mantine-color-gray-7)" } },
        body: { padding: 0 },
      }}
    >
      {note && (
        <Stack gap={0}>
          <Stack gap="xs" px="lg" pt="lg" pb="sm">
            <Text fw={600} size="xl">
              {note.title}
            </Text>

            <Group gap={4} wrap="wrap">
              <Badge size="sm" color={categoryColors[note.category] ?? "gray"} variant="light">
                {note.category}
              </Badge>
              {note.tags?.map((tag) => (
                <Badge key={tag} size="sm" color={tagColors.get(tag) ?? "gray"} variant="outline">
                  {tag}
                </Badge>
              ))}
            </Group>

            <Group gap="xs">
              <IconClock size={12} className="text-gray-400" />
              <Text size="xs" c="dimmed">
                Updated {formatDate(note.updatedAt)}
              </Text>
              <IconCalendar size={12} className="text-gray-400" />
              <Text size="xs" c="dimmed">
                Created {formatDate(note.createdAt)}
              </Text>
              <Badge size="xs" color={priorityColors[note.priority] ?? "gray"} variant="dot">
                {note.priority}
              </Badge>
            </Group>
          </Stack>

          <Divider mx="lg" />

          <ScrollArea.Autosize mah={420} mih={120}>
            <Text
              px="lg"
              py="md"
              size="sm"
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
            >
              {note.content || "No content"}
            </Text>
          </ScrollArea.Autosize>

          <Divider mx="lg" />

          <Group px="lg" py="sm" gap="xs" bg="var(--mantine-color-default)" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
            <Button
              size="compact-sm"
              variant="subtle"
              color="gray"
              leftSection={<IconPencil size={14} />}
              onClick={() => {
                openEditNote(note);
                onClose();
              }}
            >
              Edit
            </Button>
            <Tooltip label={note.isPinned ? "Unpin" : "Pin"}>
              <ActionIcon
                variant="subtle"
                color={note.isPinned ? "amber" : "gray"}
                onClick={() => updateNote.mutate({ id: note.id, isPinned: !note.isPinned })}
              >
                {note.isPinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label={note.isArchived ? "Unarchive" : "Archive"}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => updateNote.mutate({ id: note.id, isArchived: !note.isArchived }, { onSuccess: onClose })}
              >
                {note.isArchived ? <IconArchiveOff size={16} /> : <IconArchive size={16} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Modal
            opened={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            title="Delete note"
            centered
            size="sm"
          >
            <Text size="sm" mb="lg">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </Text>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                color="red"
                size="sm"
                loading={deleteNote.isPending}
                onClick={() =>
                  deleteNote.mutate(note.id, {
                    onSuccess: () => {
                      setDeleteConfirmOpen(false);
                      onClose();
                    },
                  })
                }
              >
                Delete
              </Button>
            </Group>
          </Modal>
        </Stack>
      )}
    </Modal>
  );
}
