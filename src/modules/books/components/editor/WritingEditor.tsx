"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Group, Stack, Text, Button, ActionIcon, Tooltip,
  TextInput, Loader, Center, Badge, Paper, ScrollArea, Menu,
  Kbd, Divider,
} from "@mantine/core";
import { useDisclosure, useHotkeys, useFullscreen } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconFiles, IconPlus, IconTrash, IconDotsVertical, IconArrowLeft,
  IconArrowRight, IconEye, IconDeviceFloppy, IconMaximize, IconMinimize,
  IconWriting, IconBook2, IconList, IconListTree, IconUsers,
  IconNotebook, IconSearch, IconSettings, IconChevronLeft,
  IconChevronRight, IconLayoutSidebarRightCollapse,
  IconLayoutSidebarLeftCollapse, IconLayout2, IconSun,
  IconMoon, IconArticle,
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
  subtitle: string | null;
  status: string;
  wordCount: number;
  chapterCount: number;
};

function OutlineSidebar({ content }: { content: Record<string, unknown> | null }) {
  const headings = useMemo(() => {
    if (!content) return [];
    const items: { level: number; text: string }[] = [];
    const walk = (node: Record<string, unknown>) => {
      if (node.type === "heading" && typeof node.level === "number" && typeof node.text === "string") {
        items.push({ level: node.level, text: node.text });
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: unknown) => walk(child as Record<string, unknown>));
      }
    };
    walk(content);
    return items;
  }, [content]);

  if (headings.length === 0) {
    return (
      <Stack align="center" gap="xs" p="md">
        <IconListTree size={20} opacity={0.3} />
        <Text size="xs" c="dimmed">No headings yet</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={2} p="xs">
      <Text size="xs" fw={600} c="dimmed" mb="xs" px="xs">OUTLINE</Text>
      {headings.map((h, i) => (
        <Text
          key={i}
          size="xs"
          lineClamp={1}
          pl={h.level * 12}
          style={{
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 4,
            fontSize: h.level === 1 ? 13 : 12,
            fontWeight: h.level === 1 ? 600 : 400,
          }}
        >
          {h.text}
        </Text>
      ))}
    </Stack>
  );
}

export function WritingEditor() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();

  const [chapterSidebar, { toggle: toggleChapterSidebar }] = useDisclosure(true);
  const [outlineSidebar, { toggle: toggleOutlineSidebar }] = useDisclosure(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const contentRef = useRef<Record<string, unknown>>({ type: "doc", content: [] });

  useHotkeys([
    ["mod+Shift+e", () => toggleChapterSidebar()],
    ["mod+Shift+o", () => toggleOutlineSidebar()],
    ["mod+Shift+f", () => setFocusMode((v) => !v)],
    ["mod+Shift+z", () => setZenMode((v) => !v)],
    ["mod+Shift+s", () => flushAutosave()],
    ["mod+Shift+n", () => createChapterMutation.mutate()],
  ]);

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
      setSelectedChapterId(null);
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

  const currentIndex = chapters?.findIndex((c) => c.id === selectedChapterId) ?? -1;

  if (bookLoading || chaptersLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (!book) {
    return <Center h="100vh"><Text c="dimmed">Book not found</Text></Center>;
  }

  if (zenMode) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Group px="md" py={4} justify="space-between">
          <Text size="xs" c="dimmed">{book.title}</Text>
          <Group gap={4}>
            <Badge size="xs" variant="light">
              {selectedChapter?.wordCount.toLocaleString()} words
            </Badge>
            <Tooltip label="Exit zen mode (⌘⇧Z)">
              <ActionIcon variant="subtle" size="sm" onClick={() => setZenMode(false)}>
                <IconMaximize size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <div style={{ flex: 1, overflow: "auto", padding: "0 15%" }}>
          {selectedChapter ? (
            <Editor
              key={selectedChapter.id}
              content={selectedChapter.content}
              onChange={handleContentChange}
              minHeight="100%"
              placeholder="Start writing..."
            />
          ) : (
            <Center h="100%">
              <Stack align="center" gap="md">
                <IconWriting size={48} stroke={1.5} opacity={0.3} />
                <Text c="dimmed">No chapter selected</Text>
              </Stack>
            </Center>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <Group
        px="md"
        py={6}
        justify="space-between"
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
          flexShrink: 0,
          background: focusMode ? "transparent" : undefined,
        }}
      >
        <Group gap={4}>
          <Tooltip label="Back to library">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => router.push("/creator-studio/books")}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>

          <Text size="sm" fw={500} lineClamp={1} maw={200}>
            {book.title}
          </Text>

          <Divider orientation="vertical" />

          <Tooltip label="Chapter sidebar (⌘⇧E)">
            <ActionIcon
              variant={chapterSidebar ? "filled" : "subtle"}
              size="sm"
              onClick={toggleChapterSidebar}
            >
              <IconFiles size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Outline (⌘⇧O)">
            <ActionIcon
              variant={outlineSidebar ? "filled" : "subtle"}
              size="sm"
              onClick={toggleOutlineSidebar}
            >
              <IconListTree size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap={4}>
          {selectedChapter && (
            <>
              <Badge size="sm" variant="light" color="gray">
                {selectedChapter.wordCount.toLocaleString()} words
              </Badge>
              <Group gap={2}>
                <Tooltip label="Previous chapter">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={currentIndex <= 0}
                    onClick={() => {
                      flushAutosave();
                      if (chapters && currentIndex > 0) {
                        setSelectedChapterId(chapters[currentIndex - 1].id);
                      }
                    }}
                  >
                    <IconChevronLeft size={14} />
                  </ActionIcon>
                </Tooltip>
                <Text size="xs" c="dimmed" style={{ minWidth: 40, textAlign: "center" }}>
                  {currentIndex + 1}/{chapters?.length ?? 0}
                </Text>
                <Tooltip label="Next chapter">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={currentIndex >= (chapters?.length ?? 0) - 1}
                    onClick={() => {
                      flushAutosave();
                      if (chapters && currentIndex < chapters.length - 1) {
                        setSelectedChapterId(chapters[currentIndex + 1].id);
                      }
                    }}
                  >
                    <IconChevronRight size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </>
          )}

          <Divider orientation="vertical" />

          <Tooltip label="Save now (⌘⇧S)">
            <ActionIcon variant="subtle" size="sm" onClick={() => flushAutosave()}>
              <IconDeviceFloppy size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Focus mode (⌘⇧F)">
            <ActionIcon
              variant={focusMode ? "filled" : "subtle"}
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
            >
              <IconMinimize size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Zen mode (⌘⇧Z)">
            <ActionIcon
              variant={zenMode ? "filled" : "subtle"}
              size="sm"
              onClick={() => setZenMode(true)}
            >
              <IconArticle size={14} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={toggleFullscreen}
            >
              {fullscreen ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Read mode">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                flushAutosave();
                router.push(`/creator-studio/books/${bookId}/read`);
              }}
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Main editor area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chapter sidebar */}
        {chapterSidebar && (
          <Paper
            style={{
              width: 260,
              borderRight: "1px solid var(--mantine-color-default-border)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <Group px="sm" py="xs" justify="space-between">
              <Text size="xs" fw={600} c="dimmed">CHAPTERS</Text>
              <Tooltip label="New chapter (⌘⇧N)">
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => createChapterMutation.mutate()}
                  loading={createChapterMutation.isPending}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <ScrollArea style={{ flex: 1 }}>
              <Stack gap={2} px={4}>
                {chapters?.map((chapter, i) => (
                  <Paper
                    key={chapter.id}
                    p="xs"
                    radius="sm"
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
                        <IconFiles size={12} opacity={0.4} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" lineClamp={1}>{chapter.title}</Text>
                          <Text size="xs" c="dimmed">{chapter.wordCount.toLocaleString()} words</Text>
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
          </Paper>
        )}

        {/* Editor */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {selectedChapter ? (
            <>
              {/* Chapter title input */}
              <div style={{
                padding: focusMode ? "24px 20% 0" : "8px 16px 0",
                flexShrink: 0,
              }}>
                <TextInput
                  value={chapterTitle}
                  onChange={(e) => {
                    setChapterTitle(e.currentTarget.value);
                    updateTitleMutation.mutate(e.currentTarget.value);
                  }}
                  variant="unstyled"
                  size="xl"
                  placeholder="Chapter title..."
                  styles={{
                    input: {
                      fontWeight: 700,
                      fontSize: 24,
                      lineHeight: 1.3,
                    },
                  }}
                />
              </div>

              <div style={{
                flex: 1,
                overflow: "auto",
                padding: focusMode ? "0 20%" : "0",
              }}>
                <Editor
                  key={selectedChapter.id}
                  content={selectedChapter.content}
                  onChange={handleContentChange}
                  minHeight="100%"
                  placeholder="Start writing..."
                />
              </div>
            </>
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

        {/* Outline sidebar */}
        {outlineSidebar && selectedChapter && (
          <Paper
            style={{
              width: 220,
              borderLeft: "1px solid var(--mantine-color-default-border)",
              flexShrink: 0,
              overflow: "auto",
            }}
          >
            <OutlineSidebar content={selectedChapter.content} />
          </Paper>
        )}
      </div>
    </div>
  );
}
