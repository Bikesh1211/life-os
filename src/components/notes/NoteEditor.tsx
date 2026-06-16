"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Group,
  TextInput,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Select,
  Paper,
  Button,
  Menu,
  ScrollArea,
  Divider,
  Modal,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconTrash,
  IconPin,
  IconPinFilled,
  IconDots,
  IconLink,
  IconLinkOff,
  IconStar,
  IconStarFilled,
  IconArchive,
  IconArchiveOff,
  IconCopy,
  IconExternalLink,
  IconPhoto,
} from "@tabler/icons-react";
import type { Note } from "@/modules/notes";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { useUpdateNote, useDeleteNote, useNoteLinks, useNoteBacklinks, useCreateNoteLink, useDeleteNoteLink, useNoteFolders } from "@/hooks/use-notes";

const categoryColors: Record<string, string> = {
  personal: "grape",
  work: "blue",
  study: "teal",
  ideas: "yellow",
  journal: "pink",
};

const statusColors: Record<string, string> = {
  draft: "gray",
  published: "green",
  archived: "orange",
};

type NoteEditorProps = {
  note: Note;
};

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createLink = useCreateNoteLink();
  const deleteLink = useDeleteNoteLink();
  const { data: folders } = useNoteFolders();
  const { data: links } = useNoteLinks(note.id);
  const { data: backlinks } = useNoteBacklinks(note.id);

  const [title, setTitle] = useState(note.title);
  const contentJsonRef = useRef<unknown>(note.contentJson ?? null);
  const contentTextRef = useRef(note.content ?? "");
  const excerptRef = useRef(note.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(note.coverImage ?? "");
  const [category, setCategory] = useState(note.category ?? "personal");
  const [status, setStatus] = useState(note.status ?? "draft");
  const [priority, setPriority] = useState(note.priority ?? "medium");
  const [folderId, setFolderId] = useState<string | null>(note.folderId ?? null);
  const [isPinned, setIsPinned] = useState(note.isPinned ?? false);
  const [linkNoteId, setLinkNoteId] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCoverInput, setShowCoverInput] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    title !== note.title ||
    contentTextRef.current !== (note.content ?? "") ||
    category !== (note.category ?? "personal") ||
    status !== (note.status ?? "draft") ||
    priority !== (note.priority ?? "medium") ||
    folderId !== (note.folderId ?? null) ||
    isPinned !== (note.isPinned ?? false) ||
    coverImage !== (note.coverImage ?? "");

  const doSave = useCallback(
    async (data: Record<string, unknown>) => {
      setSaving(true);
      try {
        await updateNote.mutateAsync({ id: note.id, ...data });
      } finally {
        setSaving(false);
        setDirty(false);
      }
    },
    [note.id, updateNote],
  );

  const queueSave = useCallback(
    (data: Record<string, unknown>) => {
      setDirty(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => doSave(data), 2000);
    },
    [doSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleEditorChange = useCallback(
    (json: unknown, _html: string, text: string) => {
      contentJsonRef.current = json;
      contentTextRef.current = text;
      const firstLine = text.split("\n").find((l) => l.trim()) ?? "";
      excerptRef.current = firstLine.length > 200 ? firstLine.slice(0, 200) + "..." : firstLine;
      queueSave({ contentJson: json, content: text, excerpt: excerptRef.current });
    },
    [queueSave],
  );

  const handleSaveNow = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (!hasChanges && !dirty) return;
    await doSave({
      title,
      content: contentTextRef.current,
      contentJson: contentJsonRef.current,
      excerpt: excerptRef.current,
      coverImage: coverImage || null,
      category,
      status,
      priority,
      folderId,
      isPinned,
    });
  }, [
    title, coverImage, category, status, priority, folderId, isPinned,
    hasChanges, dirty, doSave,
  ]);

  const handleDelete = useCallback(async () => {
    await deleteNote.mutateAsync(note.id);
    router.push("/notes");
  }, [note.id, deleteNote, router]);

  const handleDuplicate = useCallback(async () => {
    await updateNote.mutateAsync({ id: note.id, _action: "duplicate" });
  }, [note.id, updateNote]);

  const handleAddLink = useCallback(async () => {
    if (!linkNoteId.trim()) return;
    try {
      await createLink.mutateAsync({ noteId: note.id, linkedNoteId: linkNoteId.trim() });
      setLinkNoteId("");
      setShowLinkModal(false);
    } catch { }
  }, [linkNoteId, note.id, createLink]);

  return (
    <Box className="h-full flex flex-col" pos="relative">
      <LoadingOverlay visible={saving} zIndex={1000} overlayProps={{ blur: 1 }} />

      {/* Header bar */}
      <Paper
        withBorder={false}
        className="sticky top-0 z-10 border-b border-[var(--mantine-color-dark-5)]"
        px="md"
        py="sm"
        style={{ background: "var(--mantine-color-body)" }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            <Tooltip label="Back to notes">
              <ActionIcon variant="subtle" onClick={() => router.push("/notes")}>
                <IconArrowLeft size={18} />
              </ActionIcon>
            </Tooltip>
            <Text size="sm" c="dimmed" className="hidden sm:inline">
              {note.title || "Untitled"}
            </Text>
          </Group>

          <Group gap={4}>
            {dirty && (
              <Badge size="sm" variant="dot" color="yellow">
                Unsaved
              </Badge>
            )}
            {status === "archived" && (
              <Badge size="sm" color="orange" variant="light">
                Archived
              </Badge>
            )}

            <Button size="compact-sm" variant="light" onClick={handleSaveNow} disabled={!hasChanges && !dirty}>
              Save
            </Button>

            <Menu shadow="md" width={200} withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={isPinned ? <IconPinFilled size={14} /> : <IconPin size={14} />}
                  onClick={() => {
                    setIsPinned(!isPinned);
                    queueSave({ isPinned: !isPinned });
                  }}
                >
                  {isPinned ? "Unpin" : "Pin to top"}
                </Menu.Item>
                <Menu.Item
                  leftSection={status === "archived" ? <IconArchiveOff size={14} /> : <IconArchive size={14} />}
                  onClick={() => {
                    const newStatus = status === "archived" ? "published" : "archived";
                    setStatus(newStatus);
                    queueSave({ status: newStatus });
                  }}
                >
                  {status === "archived" ? "Restore" : "Archive"}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={handleDuplicate}
                >
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLink size={14} />}
                  onClick={() => setShowLinkModal(true)}
                >
                  Link to note
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Cover Image */}
          {coverImage && (
            <div className="relative mb-4 group">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <ActionIcon
                variant="filled"
                color="dark"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setCoverImage("");
                  queueSave({ coverImage: null });
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </div>
          )}
          {!coverImage && showCoverInput && (
            <div className="mb-4">
              <Editor
                content={textToEditorContent(coverImage)}
                onChange={(_json, _html, text) => {
                  setCoverImage(text);
                  if (text) queueSave({ coverImage: text });
                }}
                placeholder="Paste cover image URL..."
                minHeight="40px"
                showToolbar={false}
              />
            </div>
          )}

          {/* Title */}
          <TextInput
            variant="unstyled"
            placeholder="Untitled"
            value={title}
            onChange={(e) => {
              setTitle(e.currentTarget.value);
              queueSave({ title: e.currentTarget.value || "Untitled" });
            }}
            onBlur={() => {
              if (!title.trim()) {
                setTitle("Untitled");
                queueSave({ title: "Untitled" });
              }
            }}
            size="xl"
            styles={{
              input: {
                fontWeight: 700,
                fontSize: "2rem",
                height: "auto",
                padding: 0,
                marginBottom: "0.5rem",
              },
            }}
          />

          {/* Metadata bar */}
          <Group gap="xs" mb="md" wrap="wrap">
            <Select
              data={["draft", "published", "archived"]}
              value={status}
              onChange={(v) => {
                if (v) { setStatus(v); queueSave({ status: v }); }
              }}
              size="xs"
              className="w-28"
            />
            <Select
              data={["personal", "work", "study", "ideas", "journal"]}
              value={category}
              onChange={(v) => {
                if (v) { setCategory(v); queueSave({ category: v }); }
              }}
              size="xs"
              className="w-28"
            />
            <Select
              data={["low", "medium", "high"]}
              value={priority}
              onChange={(v) => {
                if (v) { setPriority(v); queueSave({ priority: v }); }
              }}
              size="xs"
              className="w-24"
            />
            <Select
              data={[
                { value: "", label: "No folder" },
                ...(folders ?? []).map((f: { id: string; name: string }) => ({
                  value: f.id,
                  label: f.name,
                })),
              ]}
              value={folderId ?? ""}
              onChange={(v) => {
                setFolderId(v || null);
                queueSave({ folderId: v || null });
              }}
              size="xs"
              className="w-36"
              clearable
            />
            <Tooltip label={showCoverInput ? "Close" : "Add cover image"}>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setShowCoverInput(!showCoverInput)}
              >
                <IconPhoto size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={isPinned ? "Unpin" : "Pin"}>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => {
                  setIsPinned(!isPinned);
                  queueSave({ isPinned: !isPinned });
                }}
              >
                {isPinned ? <IconStarFilled size={14} className="text-amber-500" /> : <IconStar size={14} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Editor */}
          <div className="border border-[var(--mantine-color-dark-5)] rounded-lg overflow-hidden">
            <Editor
              content={contentJsonRef.current ?? textToEditorContent(note.content)}
              onChange={handleEditorChange}
              placeholder="Start writing..."
            />
          </div>

          {/* Linked Notes & Backlinks */}
          <Divider my="xl" label="Linked Notes" labelPosition="center" />

          <Stack gap="sm">
            {(links && Array.isArray(links) && links.length > 0) && (
              <>
                <Text size="sm" fw={500} c="dimmed">Outgoing Links</Text>
                {(links as Array<Record<string, unknown>>).map((link: Record<string, unknown>) => {
                  const linkedNote = link.linkedNote as Record<string, unknown> | undefined;
                  return (
                    <Paper key={link.id as string} withBorder p="xs" className="flex items-center justify-between">
                      <Group gap="xs">
                        <IconExternalLink size={14} className="text-gray-400" />
                        <Text
                          size="sm"
                          className="cursor-pointer hover:underline"
                          onClick={() => router.push(`/notes/${link.linkedNoteId as string}`)}
                        >
                          {(linkedNote?.title as string) ?? (link.linkedNoteId as string)}
                        </Text>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="red"
                        onClick={() => deleteLink.mutate({ id: link.id as string, noteId: note.id })}
                      >
                        <IconLinkOff size={14} />
                      </ActionIcon>
                    </Paper>
                  );
                })}
              </>
            )}

            {(backlinks && Array.isArray(backlinks) && backlinks.length > 0) && (
              <>
                <Text size="sm" fw={500} c="dimmed">Backlinks</Text>
                {(backlinks as Array<Record<string, unknown>>).map((link: Record<string, unknown>) => {
                  const sourceNote = link.sourceNote as Record<string, unknown> | undefined;
                  return (
                    <Paper key={link.id as string} withBorder p="xs">
                      <Group gap="xs">
                        <IconLink size={14} className="text-gray-400" />
                        <Text
                          size="sm"
                          className="cursor-pointer hover:underline"
                          onClick={() => router.push(`/notes/${link.noteId as string}`)}
                        >
                          {(sourceNote?.title as string) ?? (link.noteId as string)}
                        </Text>
                      </Group>
                    </Paper>
                  );
                })}
              </>
            )}

            {(!links || (links as Array<unknown>).length === 0) &&
             (!backlinks || (backlinks as Array<unknown>).length === 0) && (
              <Text size="sm" c="dimmed" className="text-center py-4">
                No linked notes yet.
              </Text>
            )}
          </Stack>
        </div>
      </ScrollArea>

      {/* Link Note Modal */}
      <Modal
        opened={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link to another note"
        size="sm"
        centered
      >
        <Editor
          content={textToEditorContent(linkNoteId)}
          onChange={(_json, _html, text) => setLinkNoteId(text)}
          placeholder="Enter note ID to link..."
          minHeight="60px"
          showToolbar={false}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setShowLinkModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddLink} loading={createLink.isPending}>
            Link
          </Button>
        </Group>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete note"
        size="sm"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete <strong>{title}</strong>?
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button color="red" loading={deleteNote.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
