"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBold,
  IconItalic,
  IconList,
  IconListCheck,
  IconCode,
  IconLink,
  IconHeading,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
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

  const [category, setCategory] = useState<string>("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<string>("medium");

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (editingNote) {
        if (titleRef.current) titleRef.current.value = editingNote.title;
        if (contentRef.current) contentRef.current.value = editingNote.content ?? "";
        setCategory(editingNote.category);
        setTags(editingNote.tags);
        setPriority(editingNote.priority);
      }
      titleRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, editingNote]);

  const handleClose = useCallback(() => {
    if (titleRef.current) titleRef.current.value = "";
    if (contentRef.current) contentRef.current.value = "";
    setCategory("personal");
    setTags([]);
    setPriority("medium");
    closeQuickNote();
  }, [closeQuickNote]);

  const handleSave = useCallback(() => {
    const title = titleRef.current?.value.trim() || "Untitled";
    const content = contentRef.current?.value ?? "";
    if (editingNote) {
      updateNote.mutate(
        { id: editingNote.id, title, content, category, tags, priority },
        { onSuccess: handleClose },
      );
    } else {
      createNote.mutate(
        { title, content, category, tags, priority },
        { onSuccess: handleClose },
      );
    }
  }, [createNote, updateNote, editingNote, handleClose, category, tags, priority]);

  const insertFormatting = useCallback((before: string, after: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    textarea.value =
      textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, []);

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
          ref={titleRef}
          placeholder="Title"
          defaultValue=""
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

        <Group gap={4} px="lg" pb="sm">
          <Tooltip label="Heading">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("### ", "\n")}>
              <IconHeading size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Bold">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("**", "**")}>
              <IconBold size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Italic">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("*", "*")}>
              <IconItalic size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Bullet list">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("\n- ", "")}>
              <IconList size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Checklist">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("\n- [ ] ", "")}>
              <IconListCheck size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Code">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("`", "`")}>
              <IconCode size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Link">
            <ActionIcon variant="subtle" size="sm" color="gray" onClick={() => insertFormatting("[", "](url)")}>
              <IconLink size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Textarea
          ref={contentRef}
          placeholder="Start writing..."
          defaultValue=""
          minRows={8}
          maxRows={16}
          autosize
          variant="unstyled"
          px="lg"
          pb="md"
          styles={{
            input: {
              fontFamily: "var(--mantine-font-family)",
              lineHeight: 1.7,
              "&::placeholder": { color: "var(--mantine-color-gray-5)" },
            },
          }}
        />

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
