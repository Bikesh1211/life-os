"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Stack, Text, Group, Button, ActionIcon, Tooltip,
  Loader, Center, ScrollArea, Paper, Select, Slider,
  Divider, Kbd,
} from "@mantine/core";
import { useDisclosure, useLocalStorage, useHotkeys, useFullscreen } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBook2, IconList, IconSettings, IconSun, IconMoon,
  IconZoomIn, IconZoomOut, IconMaximize, IconMinimize,
  IconArrowLeft, IconArrowRight, IconBookmark, IconBookmarkFilled,
  IconHighlight, IconPhoto, IconEye, IconTypography,
  IconLayoutDistributeHorizontal, IconCircleArrowLeft,
  IconCircleArrowRight, IconX, IconChevronLeft,
  IconChevronRight, IconStar, IconStarFilled,
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
  wordCount: number;
};

type Bookmark = {
  id: string;
  chapterId: string;
  label: string | null;
  color: string;
};

const readingThemes = [
  { value: "light", label: "Light", icon: IconSun, bg: "#ffffff", color: "#1a1a1a" },
  { value: "sepia", label: "Sepia", icon: IconPhoto, bg: "#f5e6c8", color: "#5b4636" },
  { value: "dark", label: "Dark", icon: IconMoon, bg: "#1a1a2e", color: "#e0e0e0" },
  { value: "oled", label: "OLED", icon: IconMoon, bg: "#000000", color: "#e0e0e0" },
  { value: "paper", label: "Paper", icon: IconBook2, bg: "#f0ece4", color: "#3d3229" },
  { value: "cream", label: "Cream", icon: IconBook2, bg: "#faf3e0", color: "#4a3b32" },
];

const fontFamilies = [
  { value: "georgia", label: "Georgia" },
  { value: "garamond", label: "Garamond" },
  { value: "merriweather", label: "Merriweather" },
  { value: "lora", label: "Lora" },
  { value: "system", label: "System UI" },
  { value: "serif", label: "Serif" },
];

export function ReaderContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const router = useRouter();
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showToc, { toggle: toggleToc }] = useDisclosure(false);
  const [showSettings, { toggle: toggleSettings }] = useDisclosure(false);
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressSavedRef = useRef(false);

  const [readerTheme, setReaderTheme] = useLocalStorage<string>({
    key: "reader-theme",
    defaultValue: "sepia",
  });
  const [fontSize, setFontSize] = useLocalStorage<number>({
    key: "reader-font-size",
    defaultValue: 18,
  });
  const [fontFamily, setFontFamily] = useLocalStorage<string>({
    key: "reader-font-family",
    defaultValue: "georgia",
  });
  const [lineHeight, setLineHeight] = useLocalStorage<number>({
    key: "reader-line-height",
    defaultValue: 1.8,
  });
  const [pageWidth, setPageWidth] = useLocalStorage<number>({
    key: "reader-page-width",
    defaultValue: 720,
  });
  const [showDropCaps, setShowDropCaps] = useLocalStorage<boolean>({
    key: "reader-drop-caps",
    defaultValue: true,
  });

  useHotkeys([
    ["ArrowLeft", () => handleChapterChange(currentChapterIndex - 1)],
    ["ArrowRight", () => handleChapterChange(currentChapterIndex + 1)],
    ["t", () => toggleToc()],
    ["s", () => toggleSettings()],
    ["f", () => toggleFullscreen()],
    ["Escape", () => { if (fullscreen) toggleFullscreen(); }],
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

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/bookmarks`);
      if (!res.ok) throw new Error("Failed to load bookmarks");
      return res.json() as Promise<Bookmark[]>;
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
        body: JSON.stringify({ chapterId, scrollPosition, percentage }),
      });
    },
  });

  const addBookmarkMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const res = await fetch(`/api/books/${bookId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          position: { chapterIndex: currentChapterIndex },
          label: `Chapter ${currentChapterIndex + 1}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to add bookmark");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: "Bookmarked", message: "Bookmark added", color: "green" });
    },
  });

  const currentChapter = chapters?.[currentChapterIndex];
  const totalWords = chapters?.reduce((s, c) => s + c.wordCount, 0) ?? 0;
  const wordsRead = chapters?.slice(0, currentChapterIndex + 1).reduce((s, c) => s + c.wordCount, 0) ?? 0;
  const progress = totalWords > 0 ? Math.round((wordsRead / totalWords) * 100) : 0;

  const currentTheme = readingThemes.find((t) => t.value === readerTheme)!;
  const hasBookmark = bookmarks?.some((b) => b.chapterId === currentChapter?.id);

  const handleChapterChange = useCallback((newIndex: number) => {
    const chapters_ = chapters;
    if (!chapters_) return;
    if (newIndex < 0 || newIndex >= chapters_.length) return;

    if (currentChapter && !progressSavedRef.current) {
      saveProgressMutation.mutate(currentChapter.id);
      progressSavedRef.current = true;
    }
    progressSavedRef.current = false;
    setCurrentChapterIndex(newIndex);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapters, currentChapter, saveProgressMutation]);

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
        background: currentTheme.bg,
        color: currentTheme.color,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      {/* Top toolbar */}
      <Group
        px="md"
        py={6}
        justify="space-between"
        style={{
          borderBottom: "1px solid",
          borderColor: readerTheme === "dark" || readerTheme === "oled"
            ? "#333" : "rgba(0,0,0,0.08)",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <Group gap={4}>
          <Tooltip label="Back to library">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => router.push("/creator-studio/books")}
              style={{ color: currentTheme.color }}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 200 }}>
            {book.title}
          </Text>
          {book.subtitle && (
            <Text size="xs" c="dimmed" lineClamp={1} style={{ opacity: 0.6 }}>
              — {book.subtitle}
            </Text>
          )}
        </Group>

        <Group gap={4}>
          <Tooltip label="Table of contents (T)">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={toggleToc}
              style={{ color: currentTheme.color }}
            >
              <IconList size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Reading settings (S)">
            <ActionIcon
              variant={showSettings ? "filled" : "subtle"}
              size="sm"
              onClick={toggleSettings}
              style={{ color: currentTheme.color }}
            >
              <IconTypography size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={fullscreen ? "Exit" : "Fullscreen (F)"}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={toggleFullscreen}
              style={{ color: currentTheme.color }}
            >
              {fullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Table of Contents sidebar */}
        <AnimatePresence>
          {showToc && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: "hidden",
                borderRight: "1px solid",
                borderColor: readerTheme === "dark" || readerTheme === "oled"
                  ? "#333" : "rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
            >
              <Paper
                p="sm"
                style={{
                  width: 260,
                  height: "100%",
                  background: "transparent",
                  overflow: "auto",
                }}
              >
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={600}>Contents</Text>
                  <ActionIcon variant="subtle" size="sm" onClick={toggleToc}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                {/* Progress */}
                <Paper p="xs" radius="sm" mb="md" style={{
                  background: readerTheme === "dark" || readerTheme === "oled"
                    ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">Progress</Text>
                    <Text size="xs" fw={600}>{progress}%</Text>
                  </Group>
                  <div style={{
                    height: 3,
                    borderRadius: 2,
                    background: readerTheme === "dark" || readerTheme === "oled"
                      ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: 2,
                      background: currentTheme.color,
                      opacity: 0.5,
                      transition: "width 0.3s",
                    }} />
                  </div>
                </Paper>

                <Stack gap={2}>
                  {chapters.map((chapter, i) => (
                    <Paper
                      key={chapter.id}
                      p="xs"
                      radius="sm"
                      style={{
                        cursor: "pointer",
                        background: i === currentChapterIndex
                          ? readerTheme === "dark" || readerTheme === "oled"
                            ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                          : undefined,
                        borderLeft: i === currentChapterIndex ? `2px solid ${currentTheme.color}` : "2px solid transparent",
                      }}
                      onClick={() => {
                        handleChapterChange(i);
                        if (window.innerWidth < 768) toggleToc();
                      }}
                    >
                      <Text size="sm" fw={i === currentChapterIndex ? 600 : 400}>
                        {chapter.title}
                      </Text>
                      <Text size="xs" style={{ opacity: 0.5 }}>
                        {chapter.wordCount.toLocaleString()} words
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main reading area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  overflow: "hidden",
                  borderBottom: "1px solid",
                  borderColor: readerTheme === "dark" || readerTheme === "oled"
                    ? "#333" : "rgba(0,0,0,0.08)",
                }}
              >
                <Paper p="md" style={{ background: "transparent" }}>
                  <Group gap="xl" wrap="wrap" justify="center">
                    {/* Theme */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Theme</Text>
                      <Group gap={4}>
                        {readingThemes.map((theme) => (
                          <Tooltip key={theme.value} label={theme.label}>
                            <Paper
                              p={4}
                              radius="sm"
                              withBorder={readerTheme === theme.value}
                              style={{
                                cursor: "pointer",
                                background: theme.bg,
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: readerTheme === theme.value
                                  ? `2px solid ${currentTheme.color}`
                                  : `1px solid ${readerTheme === "dark" || readerTheme === "oled" ? "#444" : "#ddd"}`,
                              }}
                              onClick={() => setReaderTheme(theme.value)}
                            >
                              <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: theme.color,
                              }} />
                            </Paper>
                          </Tooltip>
                        ))}
                      </Group>
                    </Stack>

                    {/* Font */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Font</Text>
                      <Select
                        size="xs"
                        value={fontFamily}
                        onChange={(v) => v && setFontFamily(v)}
                        data={fontFamilies}
                        style={{ width: 130 }}
                      />
                    </Stack>

                    {/* Font size */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Size</Text>
                      <Group gap={4}>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                          disabled={fontSize <= 12}
                        >
                          <IconZoomOut size={14} />
                        </ActionIcon>
                        <Text size="xs" style={{ minWidth: 30, textAlign: "center" }}>
                          {fontSize}px
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                          disabled={fontSize >= 36}
                        >
                          <IconZoomIn size={14} />
                        </ActionIcon>
                      </Group>
                    </Stack>

                    {/* Line height */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Spacing</Text>
                      <Slider
                        value={lineHeight}
                        onChange={setLineHeight}
                        min={1.2}
                        max={2.4}
                        step={0.1}
                        size="xs"
                        style={{ width: 80 }}
                      />
                    </Stack>

                    {/* Page width */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Width</Text>
                      <Slider
                        value={pageWidth}
                        onChange={setPageWidth}
                        min={600}
                        max={900}
                        step={20}
                        size="xs"
                        style={{ width: 80 }}
                      />
                    </Stack>

                    {/* Drop caps */}
                    <Stack gap={4} align="center">
                      <Text size="xs" c="dimmed">Drop Caps</Text>
                      <ActionIcon
                        variant={showDropCaps ? "filled" : "subtle"}
                        size="sm"
                        onClick={() => setShowDropCaps(!showDropCaps)}
                      >
                        <IconStarFilled size={14} />
                      </ActionIcon>
                    </Stack>
                  </Group>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chapter content */}
          <ScrollArea
            style={{ flex: 1 }}
            viewportRef={scrollRef}
            onScrollPositionChange={() => {
              progressSavedRef.current = false;
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter?.id ?? "empty"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <div style={{
                  maxWidth: pageWidth,
                  margin: "0 auto",
                  padding: "48px 24px 80px",
                  fontFamily: fontFamily === "georgia" ? "Georgia, serif"
                    : fontFamily === "garamond" ? "'EB Garamond', Garamond, serif"
                    : fontFamily === "merriweather" ? "Merriweather, Georgia, serif"
                    : fontFamily === "lora" ? "Lora, Georgia, serif"
                    : fontFamily === "serif" ? "serif"
                    : undefined,
                }}>
                  {/* Chapter title with optional decorative divider */}
                  <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <Text
                      style={{
                        fontFamily: fontFamily === "georgia" ? "Georgia, serif"
                          : fontFamily === "garamond" ? "'EB Garamond', Garamond, serif"
                          : fontFamily === "merriweather" ? "Merriweather, Georgia, serif"
                          : fontFamily === "lora" ? "Lora, Georgia, serif"
                          : fontFamily === "serif" ? "serif"
                          : undefined,
                        fontSize: fontSize + 10,
                        lineHeight: 1.3,
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {currentChapter?.title}
                    </Text>
                    <div style={{
                      marginTop: 20,
                      width: 60,
                      height: 1,
                      background: currentTheme.color,
                      opacity: 0.3,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }} />
                  </div>

                  {/* Chapter content */}
                  <div
                    style={{
                      fontSize,
                      lineHeight,
                      letterSpacing: "0.005em",
                    }}
                    className={showDropCaps ? "reader-drop-caps" : ""}
                  >
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

                  {/* Chapter end separator */}
                  <div style={{
                    textAlign: "center",
                    marginTop: 48,
                    marginBottom: 24,
                    opacity: 0.3,
                    fontSize: 20,
                    letterSpacing: 8,
                  }}>
                    • • •
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>

          {/* Bottom navigation */}
          <Paper
            p="sm"
            style={{
              borderTop: "1px solid",
              borderColor: readerTheme === "dark" || readerTheme === "oled"
                ? "#333" : "rgba(0,0,0,0.08)",
              background: readerTheme === "oled" ? "#000" : undefined,
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap={4}>
                {currentChapterIndex > 0 ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    leftSection={<IconChevronLeft size={16} />}
                    onClick={() => handleChapterChange(currentChapterIndex - 1)}
                    style={{ color: currentTheme.color }}
                  >
                    Previous
                  </Button>
                ) : (
                  <div style={{ width: 100 }} />
                )}
              </Group>

              <Group gap="md">
                <Text size="xs" style={{ opacity: 0.5, textAlign: "center" }}>
                  {currentChapterIndex + 1} / {chapters.length}
                </Text>

                <Paper
                  px="sm"
                  py={2}
                  radius="xl"
                  style={{
                    background: readerTheme === "dark" || readerTheme === "oled"
                      ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    fontSize: 11,
                  }}
                >
                  {progress}%
                </Paper>
              </Group>

              <Group gap={4}>
                <Tooltip label="Bookmark">
                  <ActionIcon
                    variant={hasBookmark ? "filled" : "subtle"}
                    size="sm"
                    onClick={() => {
                      if (currentChapter) addBookmarkMutation.mutate(currentChapter.id);
                    }}
                    style={{ color: currentTheme.color }}
                  >
                    {hasBookmark ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
                  </ActionIcon>
                </Tooltip>

                {currentChapterIndex < chapters.length - 1 ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    rightSection={<IconChevronRight size={16} />}
                    onClick={() => handleChapterChange(currentChapterIndex + 1)}
                    style={{ color: currentTheme.color }}
                  >
                    Next
                  </Button>
                ) : (
                  <div style={{ width: 100 }} />
                )}
              </Group>
            </Group>
          </Paper>
        </div>
      </div>
    </div>
  );
}
