"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  TextInput,
  Select,
  MultiSelect,
  Group,
  Button,
  Tooltip,
  Stack,
  Text,
  ActionIcon,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useCreateNote, useUpdateNote, useDeleteNote, useNoteTags } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";

const CATEGORY_DATA = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "ideas", label: "Ideas" },
  { value: "journal", label: "Journal" },
];

const PRIORITY_DATA = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function QuickNoteModal() {
  const isOpen = useNotesStore((s) => s.isQuickNoteOpen);
  const editingNote = useNotesStore((s) => s.editingNote);
  const closeQuickNote = useNotesStore((s) => s.closeQuickNote);
  const { data: availableTags } = useNoteTags();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [contentJson, setContentJson] = useState<unknown>(null);
  const [contentText, setContentText] = useState("");
  const [category, setCategory] = useState<string>("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<string>("medium");

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (editingNote) {
        setTitle(editingNote.title);
        setContentJson(textToEditorContent(editingNote.content));
        setContentText(editingNote.content ?? "");
        setCategory(editingNote.category);
        setTags(editingNote.tags);
        setPriority(editingNote.priority);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, editingNote]);

  const handleClose = useCallback(() => {
    setTitle("");
    setContentJson(null);
    setContentText("");
    setCategory("personal");
    setTags([]);
    setPriority("medium");
    closeQuickNote();
  }, [closeQuickNote]);

  const handleSave = useCallback(() => {
    const titleVal = title.trim() || "Untitled";
    if (editingNote) {
      updateNote.mutate(
        { id: editingNote.id, title: titleVal, content: contentText, category, tags, priority },
        { onSuccess: handleClose },
      );
    } else {
      createNote.mutate(
        { title: titleVal, content: contentText, category, tags, priority },
        { onSuccess: handleClose },
      );
    }
  }, [createNote, updateNote, editingNote, handleClose, category, tags, priority, title, contentText]);

  const tagData = useMemo(
    () => (availableTags ?? []).map((t) => ({ value: t.name, label: t.name })),
    [availableTags],
  );

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
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
      <Stack gap={0}>
        <TextInput
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          size="xl"
          variant="unstyled"
          px="lg"
          pt="lg"
          pb="sm"
          styles={{
            input: {
              fontWeight: 600,
              "&::placeholder": { fontWeight: 400, color: "var(--mantine-color-gray-5)" },
            },
          }}
        />

        <div className="px-3 sm:px-4">
          <Editor
            content={contentJson ?? textToEditorContent("")}
            onChange={(json, _html, text) => {
              setContentJson(json);
              setContentText(text);
            }}
            placeholder="Start writing..."
            minHeight="150px"
          />
        </div>

        <Group
          px="lg"
          py="sm"
          bg="var(--mantine-color-default)"
          gap="xs"
          style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
        >
          <Select
            data={CATEGORY_DATA}
            value={category}
            onChange={(v) => setCategory(v ?? "personal")}
            size="xs"
            className="w-28"
          />
          <Select
            data={PRIORITY_DATA}
            value={priority}
            onChange={(v) => setPriority(v ?? "medium")}
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
            className="flex-1 min-w-0"
          />
          {editingNote && (
            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                color="red"
                size="md"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Button
            size="sm"
            variant="light"
            leftSection={<IconDeviceFloppy size={14} />}
            onClick={handleSave}
            loading={createNote.isPending || updateNote.isPending}
            ml="auto"
          >
            {editingNote ? "Update" : "Save"}
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete note"
        centered
        size="sm"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete "{editingNote?.title}"? This action cannot be undone.
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
              editingNote &&
              deleteNote.mutate(editingNote.id, {
                onSuccess: () => {
                  setDeleteConfirmOpen(false);
                  handleClose();
                },
              })
            }
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Modal>
  );
}
