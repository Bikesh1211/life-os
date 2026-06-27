"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppShell, Group, Stack, Text, Button, ActionIcon, Tooltip,
  TextInput, Loader, Center, Badge, Paper, ScrollArea, Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconFiles, IconPlus, IconTrash, IconDotsVertical, IconArrowLeft,
  IconArrowRight, IconEye, IconDeviceFloppy, IconMaximize, IconMinimize,
  IconGripVertical, IconWriting, IconBook2,
} from "@tabler/icons-react";
import { Editor } from "@/components/editor";
import { useAutosave } from "../../hooks/use-autosave";
import type { EditorChangeHandler } from "@/components/editor";

type Chapter = {
  id: string;
  bookId: string;
  partId: string | null;
  title: string;
  content: Record<string, unknown>;
  order: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};

type Book = {
  id: string;
  title: string;
  status: string;
  wordCount: number;
  chapterCount: number;
};

export function WritingEditor() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const queryClient = useQueryClient();
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(true);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const contentRef = useRef<Record<string, unknown>>({ type: "doc", content: [] });

  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) throw new Error("Failed to load book");
      return res.json() as Promise<Book>;
    },
    enabled: !!bookId,
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ["book-chapters", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/chapters`);
      if (!res.ok) throw new Error("Failed to load chapters");
      return res.json() as Promise<Chapter[]>;
    },
    enabled: !!bookId,
  });

  const selectedChapter = chapters?.find((c) => c.id === selectedChapterId) ?? null;

  useEffect(() => {
    if (chapters && chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (selectedChapter) {
      setChapterTitle(selectedChapter.title);
      contentRef.current = selectedChapter.content;
    }
  }, [selectedChapter]);

  const createChapterMutation = useMutation({
    mutationFn: async () => {
      const nextOrder = chapters?.length ?? 0;
      const res = await fetch(`/api/books/${bookId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", order: nextOrder }),
      });
      if (!res.ok) throw new Error("Failed to create chapter");
      return res.json() as Promise<Chapter>;
    },
    onSuccess: (chapter) => {
      queryClient.invalidateQueries({ queryKey: ["book-chapters", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      setSelectedChapterId(chapter.id);
      notifications.show({ title: "Created", message: "New chapter added", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to create chapter", color: "red" });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chapter");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-chapters", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      if (selectedChapterId) {
        setSelectedChapterId(null);
      }
      notifications.show({ title: "Deleted", message: "Chapter deleted", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to delete chapter", color: "red" });
    },
  });

  const saveChapter = useCallback(async (content: Record<string, unknown>) => {
    if (!selectedChapterId) return;
    const body: Record<string, unknown> = { content, title: chapterTitle };
    const res = await fetch(`/api/books/${bookId}/chapters/${selectedChapterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to save");
    queryClient.invalidateQueries({ queryKey: ["book-chapters", bookId] });
    queryClient.invalidateQueries({ queryKey: ["book", bookId] });
  }, [selectedChapterId, bookId, chapterTitle, queryClient]);

  const updateTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!selectedChapterId) return;
      const res = await fetch(`/api/books/${bookId}/chapters/${selectedChapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update title");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-chapters", bookId] });
    },
  });

  const handleContentChange = useCallback<EditorChangeHandler>(
    (json) => {
      contentRef.current = json as Record<string, unknown>;
    },
    [],
  );

  const { flush: flushAutosave } = useAutosave(
    `chapter-${selectedChapterId}`,
    contentRef.current,
    saveChapter,
    3000,
  );

  if (bookLoading || chaptersLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (!book) {
    return <Center h="100vh"><Text c="dimmed">Book not found</Text></Center>;
  }

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { desktop: !sidebarOpened, mobile: !sidebarOpened },
      }}
      padding={0}
    >
      <AppShell.Navbar p="sm" style={{ borderRight: "1px solid var(--mantine-color-default-border)" }}>
        <Group justify="space-between" mb="md">
          <Text fw={600} size="sm" lineClamp={1}>{book.title}</Text>
          <Tooltip label="Close sidebar">
            <ActionIcon variant="subtle" size="sm" onClick={toggleSidebar}>
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Button
          fullWidth
          variant="light"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={() => createChapterMutation.mutate()}
          mb="md"
          loading={createChapterMutation.isPending}
        >
          Add Chapter
        </Button>

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap={4}>
            {chapters?.map((chapter, i) => (
              <Paper
                key={chapter.id}
                p="xs"
                withBorder={selectedChapterId === chapter.id}
                style={{
                  cursor: "pointer",
                  background: selectedChapterId === chapter.id
                    ? "var(--mantine-color-default-hover)"
                    : undefined,
                }}
                onClick={() => {
                  if (selectedChapterId) flushAutosave();
                  setSelectedChapterId(chapter.id);
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <IconFiles size={14} opacity={0.4} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" lineClamp={1}>{chapter.title}</Text>
                      <Text size="xs" c="dimmed">{chapter.wordCount} words</Text>
                    </div>
                  </Group>
                  <Menu withinPortal position="right-start">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size="xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDotsVertical size={12} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => deleteChapterMutation.mutate(chapter.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack gap={0} h="100vh">
          <Group
            px="md"
            py="xs"
            justify="space-between"
            style={{
              borderBottom: "1px solid var(--mantine-color-default-border)",
              background: focusMode ? "transparent" : undefined,
            }}
          >
            <Group gap="xs">
              <Tooltip label="Toggle sidebar">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={toggleSidebar}
                >
                  <IconArrowRight size={16} />
                </ActionIcon>
              </Tooltip>

              {selectedChapter ? (
                <TextInput
                  value={chapterTitle}
                  onChange={(e) => {
                    setChapterTitle(e.currentTarget.value);
                    updateTitleMutation.mutate(e.currentTarget.value);
                  }}
                  variant="unstyled"
                  size="sm"
                  style={{ minWidth: 200 }}
                  placeholder="Chapter title..."
                />
              ) : (
                <Text size="sm" c="dimmed">No chapter selected</Text>
              )}
            </Group>

            <Group gap="xs">
              {selectedChapter && (
                <Badge size="sm" variant="light">
                  {selectedChapter.wordCount.toLocaleString()} words
                </Badge>
              )}
              <Tooltip label="Save now">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => flushAutosave()}
                >
                  <IconDeviceFloppy size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={focusMode ? "Exit focus mode" : "Focus mode"}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => setFocusMode(!focusMode)}
                >
                  {focusMode ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <div style={{ flex: 1, overflow: "auto", padding: focusMode ? "0 20%" : "0" }}>
            {selectedChapter ? (
              <Editor
                key={selectedChapter.id}
                content={selectedChapter.content}
                onChange={handleContentChange}
                minHeight="calc(100vh - 120px)"
                placeholder="Start writing..."
              />
            ) : (
              <Center h="100%">
                <Stack align="center" gap="md">
                  <IconWriting size={48} stroke={1.5} opacity={0.3} />
                  <Text c="dimmed">
                    {chapters?.length === 0
                      ? "Start by adding a chapter"
                      : "Select a chapter to edit"}
                  </Text>
                  {chapters?.length === 0 && (
                    <Button
                      leftSection={<IconPlus size={18} />}
                      onClick={() => createChapterMutation.mutate()}
                    >
                      Add First Chapter
                    </Button>
                  )}
                </Stack>
              </Center>
            )}
          </div>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
