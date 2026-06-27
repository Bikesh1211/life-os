"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AppShell, Stack, Text, Group, Button, ActionIcon, Tooltip,
  Loader, Center, ScrollArea, Paper, Badge, Menu, Select,
  Slider, TextInput,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBook2, IconList, IconSettings, IconSun, IconMoon,
  IconZoomIn, IconZoomOut, IconMaximize, IconMinimize,
  IconArrowLeft, IconArrowRight, IconBookmark, IconBookmarkFilled,
  IconHighlight, IconPhoto,
} from "@tabler/icons-react";
import { Editor } from "@/components/editor";

type Chapter = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  wordCount: number;
  order: number;
};

type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  authorByline: string | null;
  coverUrl: string | null;
};

const themes = [
  { value: "light", label: "Light", icon: IconSun },
  { value: "sepia", label: "Sepia", icon: IconPhoto },
  { value: "dark", label: "Dark", icon: IconMoon },
];

export function ReaderContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showToc, { toggle: toggleToc }] = useDisclosure(false);
  const [fullscreen, { toggle: toggleFullscreen }] = useDisclosure(false);
  const [readerTheme, setReaderTheme] = useLocalStorage<string>({
    key: "reader-theme",
    defaultValue: "sepia",
  });
  const [fontSize, setFontSize] = useLocalStorage<number>({
    key: "reader-font-size",
    defaultValue: 18,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressSavedRef = useRef(false);

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

  const saveProgressMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const scrollEl = scrollRef.current;
      const scrollPosition = scrollEl?.scrollTop ?? 0;
      const maxScroll = (scrollEl?.scrollHeight ?? 1) - (scrollEl?.clientHeight ?? 1);
      const percentage = maxScroll > 0 ? Math.round((scrollPosition / maxScroll) * 100) : 0;

      await fetch(`/api/books/${bookId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          scrollPosition,
          percentage,
        }),
      });
    },
  });

  const currentChapter = chapters?.[currentChapterIndex];

  const themeStyles: Record<string, React.CSSProperties> = {
    light: { background: "#fff", color: "#1a1a1a" },
    sepia: { background: "#f5e6c8", color: "#5b4636" },
    dark: { background: "#1a1a2e", color: "#e0e0e0" },
  };

  useEffect(() => {
    if (currentChapter && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentChapter?.id]);

  useEffect(() => {
    if (fullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [fullscreen]);

  const handleChapterChange = (newIndex: number) => {
    if (currentChapter && !progressSavedRef.current) {
      saveProgressMutation.mutate(currentChapter.id);
      progressSavedRef.current = true;
    }
    progressSavedRef.current = false;
    setCurrentChapterIndex(newIndex);
  };

  if (bookLoading || chaptersLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (!book || !chapters || chapters.length === 0) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <IconBook2 size={48} stroke={1.5} opacity={0.3} />
          <Text c="dimmed">
            {!book ? "Book not found" : "No chapters to read"}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        ...themeStyles[readerTheme],
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Group
        px="md"
        py="xs"
        justify="space-between"
        style={{
          borderBottom: "1px solid",
          borderColor: readerTheme === "dark" ? "#333" : "rgba(0,0,0,0.1)",
          userSelect: "none",
        }}
      >
        <Group gap="xs">
          <Tooltip label="Table of contents">
            <ActionIcon variant="subtle" onClick={toggleToc}>
              <IconList size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" fw={500} lineClamp={1}>
            {book.title}
            {book.authorByline && <span style={{ opacity: 0.6 }}> — {book.authorByline}</span>}
          </Text>
        </Group>

        <Group gap="xs">
          <Select
            size="xs"
            value={readerTheme}
            data={themes.map((t) => ({ value: t.value, label: t.label }))}
            onChange={(v) => v && setReaderTheme(v)}
            style={{ width: 90 }}
          />
          <Tooltip label="Decrease font size">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              disabled={fontSize <= 12}
            >
              <IconZoomOut size={16} />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" c="dimmed" style={{ minWidth: 30, textAlign: "center" }}>
            {fontSize}px
          </Text>
          <Tooltip label="Increase font size">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setFontSize(Math.min(36, fontSize + 2))}
              disabled={fontSize >= 36}
            >
              <IconZoomIn size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <ActionIcon variant="subtle" onClick={toggleFullscreen}>
              {fullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {showToc && (
          <Paper
            p="sm"
            style={{
              width: 260,
              borderRight: "1px solid",
              borderColor: readerTheme === "dark" ? "#333" : "rgba(0,0,0,0.1)",
              overflow: "auto",
              flexShrink: 0,
            }}
          >
            <Text size="sm" fw={600} mb="sm">Contents</Text>
            <Stack gap={4}>
              {chapters.map((chapter, i) => (
                <Paper
                  key={chapter.id}
                  p="xs"
                  style={{
                    cursor: "pointer",
                    background: i === currentChapterIndex
                      ? readerTheme === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)"
                      : undefined,
                  }}
                  onClick={() => {
                    handleChapterChange(i);
                    if (window.innerWidth < 768) toggleToc();
                  }}
                >
                  <Text size="sm" fw={i === currentChapterIndex ? 600 : 400}>
                    {chapter.title}
                  </Text>
                  <Text size="xs" c="dimmed">{chapter.wordCount.toLocaleString()} words</Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ScrollArea
            style={{ flex: 1 }}
            viewportRef={scrollRef}
            onScrollPositionChange={() => {
              progressSavedRef.current = false;
            }}
          >
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
              <Text
                size="xl"
                fw={700}
                mb="lg"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: fontSize + 8,
                  lineHeight: 1.3,
                }}
              >
                {currentChapter?.title}
              </Text>

              <div style={{ fontSize, lineHeight: 1.8 }}>
                {currentChapter && (
                  <Editor
                    key={currentChapter.id}
                    content={currentChapter.content}
                    editable={false}
                    showToolbar={false}
                    minHeight="auto"
                  />
                )}
              </div>

              <Group justify="space-between" mt="xl" pt="xl" style={{
                borderTop: "1px solid",
                borderColor: readerTheme === "dark" ? "#333" : "rgba(0,0,0,0.1)",
              }}>
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  disabled={currentChapterIndex === 0}
                  onClick={() => handleChapterChange(currentChapterIndex - 1)}
                >
                  Previous
                </Button>
                <Badge variant="light" size="sm">
                  {currentChapterIndex + 1} / {chapters.length}
                </Badge>
                <Button
                  variant="subtle"
                  rightSection={<IconArrowRight size={16} />}
                  disabled={currentChapterIndex === chapters.length - 1}
                  onClick={() => handleChapterChange(currentChapterIndex + 1)}
                >
                  Next
                </Button>
              </Group>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
