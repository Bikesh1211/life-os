"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader, Center, Text, Box, Group, ActionIcon, Tooltip,
  Paper, Stack, Slider, Select,
} from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowLeft, IconChevronLeft, IconChevronRight,
  IconMaximize, IconMinimize, IconTypography, IconBookmark, IconBookmarkFilled,
  IconX, IconList,
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
  wordCount: number;
};

type Bookmark = {
  id: string;
  chapterId: string;
};

const THEMES = [
  { value: "light", bg: "#ffffff", text: "#1a1a1a", border: "#e5e7eb" },
  { value: "sepia", bg: "#f5e6c8", text: "#5b4636", border: "#d4c5a9" },
  { value: "dark", bg: "#1a1a2e", text: "#e0e0e0", border: "#2d2d44" },
  { value: "oled", bg: "#000000", text: "#e0e0e0", border: "#1f1f1f" },
  { value: "paper", bg: "#f0ece4", text: "#3d3229", border: "#ddd6c8" },
  { value: "cream", bg: "#faf3e0", text: "#4a3b32", border: "#e8dcc8" },
];

const FONTS = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Lora, serif", label: "Lora" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "serif", label: "Serif" },
];

export function ReaderContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("reader-theme") || "sepia");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("reader-font-size")) || 18);
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("reader-font-family") || "Georgia, serif");
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem("reader-line-height")) || 1.8);
  const [pageWidth, setPageWidth] = useState(() => Number(localStorage.getItem("reader-page-width")) || 720);

  const saveLocal = useCallback((key: string, value: unknown) => {
    localStorage.setItem(key, String(value));
  }, []);

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

  const addBookmark = useMutation({
    mutationFn: async () => {
      if (!chapter) return;
      const res = await fetch(`/api/books/${bookId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          position: { chapterIndex },
          label: `Chapter ${chapterIndex + 1}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to add bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", bookId] });
      notifications.show({ title: "Bookmarked", message: "Bookmark added", color: "green" });
    },
  });

  const chapter = chapters?.[chapterIndex];
  const colors = THEMES.find((t) => t.value === theme) ?? THEMES[0];
  const hasBookmark = bookmarks?.some((b) => b.chapterId === chapter?.id);

  const goTo = useCallback((i: number) => {
    if (!chapters) return;
    const next = Math.max(0, Math.min(i, chapters.length - 1));
    setChapterIndex(next);
    setShowToc(false);
    setShowSettings(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapters]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(chapterIndex - 1);
      if (e.key === "ArrowRight") goTo(chapterIndex + 1);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape") { setShowToc(false); setShowSettings(false); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chapterIndex, goTo, toggleFullscreen]);

  if (bookLoading || chaptersLoading) {
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  if (!book || !chapters || chapters.length === 0) {
    return (
      <Center h="100vh">
        <Text c="dimmed">{!book ? "Book not found" : "No chapters to read"}</Text>
      </Center>
    );
  }

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column", background: colors.bg, color: colors.text, transition: "background 0.3s" }}>
      <Group px="md" py={6} justify="space-between" style={{ borderBottom: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <Group gap={4}>
          <Tooltip label="Back">
            <ActionIcon variant="subtle" size="sm" onClick={() => router.push("/creator-studio/books")} style={{ color: colors.text }}>
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 200 }}>{book.title}</Text>
        </Group>
        <Group gap={4}>
          <Tooltip label="Chapters">
            <ActionIcon variant={showToc ? "filled" : "subtle"} size="sm" onClick={() => { setShowToc((v) => !v); setShowSettings(false); }} style={{ color: colors.text }}>
              <IconList size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Settings">
            <ActionIcon variant={showSettings ? "filled" : "subtle"} size="sm" onClick={() => { setShowSettings((v) => !v); setShowToc(false); }} style={{ color: colors.text }}>
              <IconTypography size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <ActionIcon variant="subtle" size="sm" onClick={toggleFullscreen} style={{ color: colors.text }}>
              {fullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Box style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {showSettings && (
            <Paper p="md" withBorder={false} style={{ background: "transparent", borderBottom: `1px solid ${colors.border}` }}>
              <Group gap="xl" wrap="wrap" justify="center">
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed">Theme</Text>
                  <Group gap={4}>
                    {THEMES.map((t) => (
                      <Tooltip key={t.value} label={t.value}>
                        <Paper
                          p={4} radius="sm"
                          withBorder={theme === t.value}
                          style={{ width: 28, height: 28, cursor: "pointer", background: t.bg, border: theme === t.value ? `2px solid ${colors.text}` : `1px solid ${t.border}` }}
                          onClick={() => { setTheme(t.value); saveLocal("reader-theme", t.value); }}
                        />
                      </Tooltip>
                    ))}
                  </Group>
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed">Font</Text>
                  <Select size="xs" value={fontFamily} onChange={(v) => { if (v) { setFontFamily(v); saveLocal("reader-font-family", v); } }} data={FONTS} style={{ width: 130 }} />
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed">Size</Text>
                  <Group gap={4}>
                    <ActionIcon variant="subtle" size="sm" disabled={fontSize <= 12} onClick={() => { setFontSize((s) => { const n = Math.max(12, s - 2); saveLocal("reader-font-size", n); return n; }); }}><IconChevronLeft size={14} /></ActionIcon>
                    <Text size="xs" style={{ minWidth: 30, textAlign: "center" }}>{fontSize}px</Text>
                    <ActionIcon variant="subtle" size="sm" disabled={fontSize >= 36} onClick={() => { setFontSize((s) => { const n = Math.min(36, s + 2); saveLocal("reader-font-size", n); return n; }); }}><IconChevronRight size={14} /></ActionIcon>
                  </Group>
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed">Spacing</Text>
                  <Slider value={lineHeight} onChange={(v) => { setLineHeight(v); saveLocal("reader-line-height", v); }} min={1.2} max={2.4} step={0.1} size="xs" style={{ width: 80 }} />
                </Stack>
                <Stack gap={4} align="center">
                  <Text size="xs" c="dimmed">Width</Text>
                  <Slider value={pageWidth} onChange={(v) => { setPageWidth(v); saveLocal("reader-page-width", v); }} min={600} max={900} step={20} size="xs" style={{ width: 80 }} />
                </Stack>
              </Group>
            </Paper>
          )}

          <Box ref={scrollRef} style={{ flex: 1, overflow: "auto" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter?.id ?? "empty"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ maxWidth: pageWidth, margin: "0 auto", padding: "48px 24px 80px", fontFamily }}>
                  <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <Text style={{ fontSize: fontSize + 10, fontWeight: 700, lineHeight: 1.3 }}>{chapter?.title}</Text>
                    <div style={{ margin: "20px auto 0", width: 60, height: 1, background: colors.text, opacity: 0.3 }} />
                  </div>
                  <div style={{ fontSize, lineHeight }}>
                    {chapter && <Editor key={chapter.id} content={chapter.content} editable={false} showToolbar={false} minHeight="auto" />}
                  </div>
                  <div style={{ textAlign: "center", marginTop: 48, opacity: 0.3, fontSize: 20, letterSpacing: 8 }}>• • •</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>

        {showToc && (
          <Paper style={{ width: 260, borderLeft: `1px solid ${colors.border}`, overflow: "auto", flexShrink: 0, background: colors.bg }} p="sm">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={600}>Chapters</Text>
              <ActionIcon variant="subtle" size="sm" onClick={() => setShowToc(false)}><IconX size={14} /></ActionIcon>
            </Group>
            <Stack gap={2}>
              {chapters.map((ch, i) => (
                <Paper key={ch.id} p="xs" radius="sm" style={{ cursor: "pointer", background: i === chapterIndex ? "rgba(128,128,128,0.1)" : undefined, borderLeft: i === chapterIndex ? `2px solid ${colors.text}` : "2px solid transparent" }} onClick={() => goTo(i)}>
                  <Text size="sm" fw={i === chapterIndex ? 600 : 400}>{ch.title}</Text>
                  <Text size="xs" opacity={0.5}>{ch.wordCount.toLocaleString()} words</Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}
      </Box>

      <Paper p="sm" style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg, flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap={4}>
            {chapterIndex > 0 ? (
              <ActionIcon variant="subtle" onClick={() => goTo(chapterIndex - 1)} style={{ color: colors.text }}><IconChevronLeft size={18} /></ActionIcon>
            ) : <Box style={{ width: 36 }} />}
          </Group>
          <Group gap="md">
            <Text size="xs" opacity={0.5}>{chapterIndex + 1} / {chapters.length}</Text>
            <Paper px="sm" py={2} radius="xl" style={{ background: "rgba(128,128,128,0.1)", fontSize: 11 }}>
              {Math.round(((chapterIndex + 1) / chapters.length) * 100)}%
            </Paper>
            <Tooltip label="Bookmark">
              <ActionIcon variant={hasBookmark ? "filled" : "subtle"} size="sm" color={hasBookmark ? "yellow" : "gray"} onClick={() => addBookmark.mutate()} style={{ color: colors.text }}>
                {hasBookmark ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group gap={4}>
            {chapterIndex < chapters.length - 1 ? (
              <ActionIcon variant="subtle" onClick={() => goTo(chapterIndex + 1)} style={{ color: colors.text }}><IconChevronRight size={18} /></ActionIcon>
            ) : <Box style={{ width: 36 }} />}
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}
