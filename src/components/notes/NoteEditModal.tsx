"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Group,
  Button,
  Tooltip,
  ActionIcon,
  Text,
  Stack,
} from "@mantine/core";
import {
  IconPin,
  IconPinFilled,
  IconTrash,
  IconArchive,
  IconArchiveOff,
} from "@tabler/icons-react";
import { useCreateNote, useUpdateNote, useDeleteNote, useNoteTags, useTogglePin, useToggleArchive } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";
import type { Note } from "@/modules/notes";

const NOTE_COLORS = [
  { value: null, label: "Default" },
  { value: "red", label: "Red", hex: "#f28b82" },
  { value: "orange", label: "Orange", hex: "#fbbc04" },
  { value: "yellow", label: "Yellow", hex: "#fff475" },
  { value: "green", label: "Green", hex: "#ccff90" },
  { value: "teal", label: "Teal", hex: "#a7ffeb" },
  { value: "blue", label: "Blue", hex: "#cbf0f8" },
  { value: "darkblue", label: "Dark Blue", hex: "#aecbfa" },
  { value: "purple", label: "Purple", hex: "#d7aefb" },
  { value: "pink", label: "Pink", hex: "#fdcfe8" },
  { value: "brown", label: "Brown", hex: "#e6c9a8" },
  { value: "gray", label: "Gray", hex: "#e8eaed" },
];

const CATEGORY_DATA = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "ideas", label: "Ideas" },
  { value: "journal", label: "Journal" },
];

export function NoteEditModal() {
  const isOpen = useNotesStore((s) => s.isEditModalOpen);
  const note = useNotesStore((s) => s.editModalNote);
  const close = useNotesStore((s) => s.closeEditModal);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const togglePin = useTogglePin();
  const toggleArchive = useToggleArchive();
  const { data: availableTags } = useNoteTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [category, setCategory] = useState("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState("medium");
  const [isPinned, setIsPinned] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderDate, setReminderDate] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? "");
      setColor(note.color ?? null);
      setCategory(note.category);
      setTags(note.tags);
      setPriority(note.priority);
      setIsPinned(note.isPinned);
      setReminderDate(note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : null);
    } else {
      setTitle("");
      setContent("");
      setColor(null);
      setCategory("personal");
      setTags([]);
      setPriority("medium");
      setIsPinned(false);
      setReminderDate(null);
    }
  }, [isOpen, note]);

  const handleClose = useCallback(() => {
    setShowDeleteConfirm(false);
    close();
  }, [close]);

  const handleSave = useCallback(() => {
    const t = title.trim() || "Untitled";
    if (note) {
      updateNote.mutate(
        {
          id: note.id,
          title: t,
          content: content || null,
          color: color || null,
          category: category !== "personal" ? category : undefined,
          tags,
          priority,
          isPinned,
          reminderDate: reminderDate || null,
        },
        { onSuccess: handleClose },
      );
    } else {
      createNote.mutate(
        {
          title: t,
          content: content || undefined,
          color: color ?? undefined,
          category: category !== "personal" ? category : undefined,
          tags,
          priority,
          isPinned,
          reminderDate: reminderDate || null,
        },
        { onSuccess: handleClose },
      );
    }
  }, [note, title, content, color, category, tags, priority, isPinned, reminderDate, createNote, updateNote, handleClose]);

  const handleDelete = useCallback(() => {
    if (!note) return;
    deleteNote.mutate(note.id, { onSuccess: handleClose });
  }, [note, deleteNote, handleClose]);

  const modalBg = color ? NOTE_COLORS.find((c) => c.value === color)?.hex : undefined;

  const tagData = (availableTags ?? []).map((t) => ({ value: t.name, label: t.name }));

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      size="lg"
      centered
      withCloseButton
      styles={{
        header: { position: "absolute", top: 8, right: 8, zIndex: 10, padding: 0, minHeight: 0 },
        close: { color: "var(--mantine-color-gray-5)" },
        body: { padding: 0 },
        content: { backgroundColor: modalBg || "var(--mantine-color-body)" },
      }}
    >
      <Stack gap={0}>
        <TextInput
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
          }}
          size="xl"
          variant="unstyled"
          px="lg"
          pt="lg"
          pb="xs"
          styles={{
            input: {
              fontWeight: 600,
              "&::placeholder": { fontWeight: 400, color: "var(--mantine-color-gray-5)" },
            },
          }}
        />

        <Textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          variant="unstyled"
          px="lg"
          pb="md"
          size="md"
          minRows={4}
          autosize
          styles={{
            input: { lineHeight: 1.6, "&::placeholder": { color: "var(--mantine-color-gray-5)" } },
          }}
        />

        {note && note.updatedAt && (
          <Text px="lg" size="xs" c="dimmed" pb="xs">
            Edited {new Date(note.updatedAt).toLocaleString()}
          </Text>
        )}

        {/* Color picker */}
        <Group px="lg" pb="md" gap={4} wrap="wrap">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.value ?? "default"}
              onClick={() => setColor(c.value)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === c.value ? "border-blue-500 scale-110" : "border-transparent hover:scale-110"
              }`}
              style={{
                backgroundColor: c.hex || "var(--mantine-color-body)",
                borderColor: !c.hex ? "var(--border-subtle)" : color === c.value ? "#3b82f6" : "transparent",
              }}
              title={c.label}
            />
          ))}
        </Group>

        {/* Bottom bar */}
        <Group
          px="lg"
          py="sm"
          gap="xs"
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          <Tooltip label={isPinned ? "Unpin" : "Pin"}>
            <ActionIcon
              variant="subtle"
              color={isPinned ? "amber" : "gray"}
              size="md"
              onClick={() => setIsPinned(!isPinned)}
            >
              {isPinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
            </ActionIcon>
          </Tooltip>

          {note && (
            <Tooltip label={note.status === "archived" ? "Restore" : "Archive"}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => toggleArchive.mutate(note.id, { onSuccess: handleClose })}
              >
                {note.status === "archived" ? <IconArchiveOff size={16} /> : <IconArchive size={16} />}
              </ActionIcon>
            </Tooltip>
          )}

          {note && (
            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                color="red"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          <Select
            data={CATEGORY_DATA}
            value={category}
            onChange={(v) => setCategory(v ?? "personal")}
            size="xs"
            className="w-24"
          />

          <MultiSelect
            data={tagData}
            value={tags}
            onChange={setTags}
            placeholder="Tags"
            searchable
            clearable
            size="xs"
            className="w-32"
          />

          <Button
            size="compact-sm"
            variant="light"
            onClick={handleSave}
            loading={createNote.isPending || updateNote.isPending}
            ml="auto"
          >
            {note ? "Save" : "Create"}
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete note"
        centered
        size="sm"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete "{note?.title}"?
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" size="sm" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button color="red" size="sm" loading={deleteNote.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Modal>
  );
}
