"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Textarea,
  TextInput,
  Stack,
  Text,
  Group,
  ActionIcon,
  Paper,
  Badge,
  Tooltip,
  ScrollArea,
  Container,
  Box,
  Transition,
  rem,
} from "@mantine/core";
import {
  IconCheck,
  IconTrash,
  IconClock,
  IconPinFilled,
  IconWriting,
  IconPlus,
} from "@tabler/icons-react";
import { useAppShell } from "../AppShellProvider";
import { useCreateNote, useNotes, useDeleteNote } from "@/hooks/use-notes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type FormState = {
  title: string;
  content: string;
};

const INITIAL_FORM: FormState = { title: "", content: "" };

export function QuickNoteContent() {
  const { setMinimalChrome } = useAppShell();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const { data: notes } = useNotes({ limit: 20, sortBy: "updatedAt", sortOrder: "desc" });

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedForm = useDebounce(form, 1500);

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const hasContent = form.title.trim() || form.content.trim();

  const save = useCallback(
    async (f: FormState) => {
      if (!f.title.trim() && !f.content.trim()) return;
      setSaving(true);
      try {
        await createNote.mutateAsync({
          title: f.title.trim() || "Untitled",
          content: f.content.trim() || undefined,
          category: "personal",
          status: "published",
          priority: "medium",
        });
        setForm(INITIAL_FORM);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        titleRef.current?.focus();
      } finally {
        setSaving(false);
      }
    },
    [createNote],
  );

  useEffect(() => {
    if (debouncedForm.title.trim() || debouncedForm.content.trim()) {
      save(debouncedForm);
    }
  }, [debouncedForm, save]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save(form);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote.mutateAsync(id);
  };

  const clearForm = () => {
    setForm(INITIAL_FORM);
    titleRef.current?.focus();
  };

  const noteCount = notes?.length ?? 0;
  const charCount = form.content.length;
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <Box className="min-h-screen" px="md" py="xl">
      <Container size={700} px={0}>
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <Group gap="xs">
            <IconWriting size={20} className="text-blue-500" />
            <Text fw={600} size="sm" c="dimmed">
              Quick Note
            </Text>
          </Group>
          <Group gap={4}>
            {saving && (
              <Text size="xs" c="dimmed">
                Saving...
              </Text>
            )}
            <Transition mounted={saved} transition="fade" duration={400}>
              {(styles) => (
                <Group gap={4} style={styles}>
                  <IconCheck size={14} className="text-green-500" />
                  <Text size="xs" c="green">
                    Saved
                  </Text>
                </Group>
              )}
            </Transition>
          </Group>
        </Group>

        {/* Editor */}
        <Paper
          withBorder
          radius="lg"
          p="lg"
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
        >
          <Stack gap="md">
            <TextInput
              ref={titleRef}
              variant="unstyled"
              size="xl"
              placeholder="What's on your mind?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.currentTarget.value }))}
              onKeyDown={handleKeyDown}
              classNames={{ input: "font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-600" }}
              styles={{ input: { height: rem(48), padding: 0 } }}
            />

            <Textarea
                ref={textareaRef}
                variant="unstyled"
                placeholder="Start writing..."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.currentTarget.value }))}
                onKeyDown={handleKeyDown}
                autosize
                minRows={8}
                maxRows={20}
                classNames={{
                  input:
                    "text-base leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none",
                }}
                styles={{ input: { padding: 0 } }}
              />

            {/* Bottom bar */}
            <Group justify="space-between" pt="xs">
              <Group gap="xs">
                <Badge size="sm" variant="dot" color="blue">
                  personal
                </Badge>
                <Text size="xs" c="dimmed">
                  {charCount > 0 ? `${charCount} chars · ${wordCount} words` : ""}
                </Text>
              </Group>

              <Group gap={4}>
                <Tooltip label="Clear (Esc)">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    disabled={!hasContent}
                    onClick={clearForm}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Save (⌘⏎)">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="sm"
                    disabled={!hasContent || saving}
                    onClick={() => save(form)}
                  >
                    <IconCheck size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* Recent notes */}
        {noteCount > 0 && (
          <Box mt="xl">
            <Group gap="xs" mb="sm">
              <IconClock size={14} className="text-gray-400" />
              <Text size="sm" fw={500} c="dimmed">
                Recent Notes
              </Text>
            </Group>

            <Stack gap="xs">
              {notes?.slice(0, 10).map((note) => (
                <Paper
                  key={note.id}
                  withBorder
                  p="sm"
                  radius="md"
                  className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap={4} wrap="nowrap">
                        {note.isPinned && <IconPinFilled size={12} className="text-amber-500 shrink-0" />}
                        <Text size="sm" fw={500} lineClamp={1}>
                          {note.title}
                        </Text>
                      </Group>
                      {note.content && (
                        <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                          {note.content}
                        </Text>
                      )}
                      <Group gap="xs" mt={4}>
                        <Badge size="xs" color="gray" variant="dot">
                          {note.category}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {dayjs(note.updatedAt).fromNow()}
                        </Text>
                      </Group>
                    </Box>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleDelete(note.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
