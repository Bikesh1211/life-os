"use client";

import { useEffect, useState, useCallback, useMemo, useRef, type CSSProperties } from "react";
import { Loader, Center, Text, Box, Stack, Group, Tooltip, ActionIcon, Slider, Select, Paper, Modal, ScrollArea, TextInput } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { IconX, IconCheck, IconSearch } from "@tabler/icons-react";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { Editor } from "@/components/editor";
import { ReaderToolbar } from "./ReaderToolbar";
import { apiFetch } from "@/core/api/http";

export type ReaderTheme = "light" | "sepia" | "dark" | "oled" | "paper" | "cream";

export const READER_THEMES: Record<ReaderTheme, { bg: string; text: string; muted: string; border: string }> = {
  light: { bg: "#ffffff", text: "#1a1a1a", muted: "#6b7280", border: "#e5e7eb" },
  sepia: { bg: "#f5e6c8", text: "#5b4636", muted: "#8b7355", border: "#d4c5a9" },
  dark: { bg: "#1a1a2e", text: "#e0e0e0", muted: "#9ca3af", border: "#2d2d44" },
  oled: { bg: "#000000", text: "#e0e0e0", muted: "#6b7280", border: "#1f1f1f" },
  paper: { bg: "#f0ece4", text: "#3d3229", muted: "#8b7d6b", border: "#ddd6c8" },
  cream: { bg: "#faf3e0", text: "#4a3b32", muted: "#8b7d6b", border: "#e8dcc8" },
};

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
};

type Bookmark = {
  id: string;
  chapterId: string;
};

const LS_THEME_KEY = "life-os:reader-theme";
const LS_FONT_SIZE_KEY = "life-os:reader-font-size";
const LS_LINE_HEIGHT_KEY = "life-os:reader-line-height";
const LS_PAGE_WIDTH_KEY = "life-os:reader-page-width";
const LS_FONT_FAMILY_KEY = "life-os:reader-font-family";

const FONT_OPTIONS = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Lora, serif", label: "Lora" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "serif", label: "Serif" },
];

const THEME_ORDER: ReaderTheme[] = ["light", "sepia", "dark", "oled", "paper", "cream"];

function ThemeSwatch({ theme, active, onClick }: { theme: ReaderTheme; active: boolean; onClick: () => void }) {
  const colors = READER_THEMES[theme];
  return (
    <Tooltip label={theme.charAt(0).toUpperCase() + theme.slice(1)}>
      <Paper
        withBorder={active}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.bg,
          cursor: "pointer",
          border: active ? "2px solid var(--mantine-color-brand-filled)" : "1px solid var(--mantine-color-default-border)",
        }}
        onClick={onClick}
      />
    </Tooltip>
  );
}

export function ReaderContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setMinimalChrome } = useAppShell();
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();
  const [[chapterIndex, direction], setChapterIndex] = useState([0, 0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [chapterQuery, setChapterQuery] = useState("");
  const chapterSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chaptersOpen) {
      setTimeout(() => chapterSearchRef.current?.focus(), 100);
    } else {
      setChapterQuery("");
    }
  }, [chaptersOpen]);

  const [theme, setTheme] = useState<ReaderTheme>("sepia");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [pageWidth, setPageWidth] = useState(720);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");

  useEffect(() => {
    setTheme((localStorage.getItem(LS_THEME_KEY) as ReaderTheme) || "sepia");
    setFontSize(Number(localStorage.getItem(LS_FONT_SIZE_KEY)) || 18);
    setLineHeight(Number(localStorage.getItem(LS_LINE_HEIGHT_KEY)) || 1.8);
    setPageWidth(Number(localStorage.getItem(LS_PAGE_WIDTH_KEY)) || 720);
    const savedFont = localStorage.getItem(LS_FONT_FAMILY_KEY);
    if (savedFont) setFontFamily(savedFont);
  }, []);

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => apiFetch<Book>(`/api/books/${bookId}`),
    enabled: !!bookId,
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ["book-chapters", bookId],
    queryFn: () => apiFetch<Chapter[]>(`/api/books/${bookId}/chapters`),
    enabled: !!bookId,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", bookId],
    queryFn: () => apiFetch<Bookmark[]>(`/api/books/${bookId}/bookmarks`),
    enabled: !!bookId,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const existing = bookmarks?.find((b) => b.chapterId === chapterId);
      if (existing) {
        await apiFetch(`/api/books/${bookId}/bookmarks/${existing.id}`, { method: "DELETE" });
        return { type: "remove" as const, chapterId };
      }
      await apiFetch(`/api/books/${bookId}/bookmarks`, {
        method: "POST",
        body: JSON.stringify({ chapterId, label: chapters?.[chapterIndex]?.title ?? `Chapter ${chapterIndex + 1}` }),
      });
      return { type: "add" as const, chapterId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", bookId] });
      notifications.show({
        title: result.type === "add" ? "Bookmarked" : "Bookmark removed",
        message: result.type === "add" ? "Chapter bookmarked" : "Bookmark removed",
        color: result.type === "add" ? "green" : "orange",
      });
    },
  });

  const totalChapters = chapters?.length ?? 0;

  const paginate = useCallback(
    (newDirection: number) => {
      const next = chapterIndex + newDirection;
      if (next < 0 || next >= totalChapters) return;
      setChapterIndex([next, newDirection]);
      setSettingsOpen(false);
    },
    [chapterIndex, totalChapters],
  );

  const goToChapter = useCallback((index: number) => {
    setChapterIndex([index, index > chapterIndex ? 1 : -1]);
    setSettingsOpen(false);
    setChaptersOpen(false);
  }, [chapterIndex]);

  const handleToggleBookmark = useCallback(() => {
    const ch = chapters?.[chapterIndex];
    if (!ch) return;
    toggleBookmarkMutation.mutate(ch.id);
  }, [chapters, chapterIndex, toggleBookmarkMutation]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      localStorage.setItem(LS_THEME_KEY, next);
      return next;
    });
  }, []);

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    const q = chapterQuery.toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter((ch) => ch.title.toLowerCase().includes(q));
  }, [chapters, chapterQuery]);

  const currentChapter = chapters?.[chapterIndex] ?? null;
  const hasBookmark = bookmarks?.some((b) => b.chapterId === currentChapter?.id) ?? false;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (searchOpen || chaptersOpen) return;
      switch (e.key) {
        case "ArrowRight":
          paginate(1);
          break;
        case "ArrowLeft":
          paginate(-1);
          break;
        case "Home":
          setChapterIndex([0, -1]);
          break;
        case "End":
          setChapterIndex([totalChapters - 1, 1]);
          break;
        case "Escape":
          if (settingsOpen) { setSettingsOpen(false); break; }
          router.push("/creator-studio/books");
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "t":
        case "T":
          cycleTheme();
          break;
        case "s":
        case "S":
          setSettingsOpen((v) => !v);
          break;
        case "b":
        case "B":
          handleToggleBookmark();
          break;
        case "l":
        case "L":
          setChaptersOpen((v) => !v);
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, totalChapters, searchOpen, chaptersOpen, router, toggleFullscreen, cycleTheme, settingsOpen, handleToggleBookmark]);

  const colors = READER_THEMES[theme];

  if (bookLoading || chaptersLoading) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Loader />
      </Center>
    );
  }

  if (!book || !chapters || chapters.length === 0) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Text c="red" size="sm">{!book ? "Book not found" : "No chapters yet"}</Text>
      </Center>
    );
  }

  return (
    <Box
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: colors.bg,
        transition: "background-color 0.3s ease",
      }}
      className="overflow-hidden"
    >
      <div className="flex h-full items-center justify-center px-2 sm:px-4 pb-16 pt-2 sm:pt-4">
        <div className="relative h-full w-full" style={{ maxWidth: pageWidth + 80 }}>
          <div
            className="relative h-full w-full overflow-hidden rounded-none sm:rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={chapterIndex}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35, mass: 1 }}
                className="absolute inset-0"
              >
                <div
                  className="mx-auto flex h-full w-full flex-col px-4 sm:px-10 py-6 sm:py-14"
                  style={{
                    maxWidth: "100%",
                    color: colors.text,
                  }}
                >
                  <Text
                    size="sm"
                    className="mb-2 tracking-wide"
                    style={{ color: colors.muted, fontSize: Math.max(12, fontSize - 4) }}
                  >
                    {currentChapter?.title ?? ""}
                  </Text>
                  <div
                    className="mb-4 sm:mb-6 h-px"
                    style={{
                      background: `linear-gradient(to right, ${colors.border}, ${colors.border}88, transparent)`,
                    }}
                  />
                  <div
                    className="reader-scroll -mr-2 flex-1 space-y-6 overflow-y-auto pr-1"
                    style={{ fontFamily, fontSize, lineHeight, "--reader-scroll-tint": colors.muted } as CSSProperties}
                  >
                    {currentChapter && (
                      <Editor content={currentChapter.content} editable={false} showToolbar={false} minHeight="auto" />
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {settingsOpen && (
              <Paper
                shadow="lg"
                withBorder
                className="reader-scroll"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: "min(300px, calc(100vw - 16px))",
                  maxHeight: "calc(100% - 16px)",
                  overflow: "auto",
                  zIndex: 50,
                  backgroundColor: colors.bg,
                  color: colors.text,
                  "--reader-scroll-tint": colors.muted,
                } as CSSProperties}
                p="md"
              >
                <Group justify="space-between" mb="md">
                  <Text size="sm" fw={600}>Reading settings</Text>
                  <ActionIcon variant="subtle" size="sm" onClick={() => setSettingsOpen(false)}>
                    <IconX size={14} />
                  </ActionIcon>
                </Group>

                <Stack gap="md">
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Theme</Text>
                    <Group gap={4}>
                      {THEME_ORDER.map((t) => (
                        <ThemeSwatch
                          key={t}
                          theme={t}
                          active={theme === t}
                          onClick={() => {
                            setTheme(t);
                            localStorage.setItem(LS_THEME_KEY, t);
                          }}
                        />
                      ))}
                    </Group>
                  </div>

                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Font</Text>
                    <Select
                      size="xs"
                      data={FONT_OPTIONS}
                      value={fontFamily}
                      onChange={(v) => {
                        if (v) { setFontFamily(v); localStorage.setItem(LS_FONT_FAMILY_KEY, v); }
                      }}
                    />
                  </div>

                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Font size: {fontSize}px</Text>
                    <Slider
                      size="xs"
                      min={12}
                      max={36}
                      step={2}
                      value={fontSize}
                      onChange={(v) => { setFontSize(v); localStorage.setItem(LS_FONT_SIZE_KEY, String(v)); }}
                    />
                  </div>

                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Line height: {lineHeight.toFixed(1)}</Text>
                    <Slider
                      size="xs"
                      min={1.2}
                      max={2.4}
                      step={0.1}
                      value={lineHeight}
                      onChange={(v) => { setLineHeight(v); localStorage.setItem(LS_LINE_HEIGHT_KEY, String(v)); }}
                    />
                  </div>

                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Page width: {pageWidth}px</Text>
                    <Slider
                      size="xs"
                      min={600}
                      max={900}
                      step={20}
                      value={pageWidth}
                      onChange={(v) => { setPageWidth(v); localStorage.setItem(LS_PAGE_WIDTH_KEY, String(v)); }}
                    />
                  </div>
                </Stack>
              </Paper>
            )}
          </div>
        </div>
      </div>

      <ReaderToolbar
        currentChapter={chapterIndex}
        totalChapters={totalChapters}
        currentChapterTitle={currentChapter?.title ?? ""}
        searchOpen={searchOpen}
        fullscreen={fullscreen}
        hasBookmark={hasBookmark}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onToggleSearch={() => setSearchOpen((p) => !p)}
        onToggleFullscreen={toggleFullscreen}
        onToggleTheme={cycleTheme}
        onToggleSettings={() => { setSettingsOpen((v) => !v); setChaptersOpen(false); }}
        onToggleBookmark={handleToggleBookmark}
        onToggleChapters={() => { setChaptersOpen((v) => !v); setSettingsOpen(false); }}
        onClose={() => router.push("/creator-studio/books")}
      />

      <Modal
        opened={chaptersOpen}
        onClose={() => setChaptersOpen(false)}
        title="Chapters"
        size="md"
        closeButtonProps={{ icon: <IconX size={16} /> }}
        scrollAreaComponent={ScrollArea}
      >
        <Stack gap="md">
          <TextInput
            ref={chapterSearchRef}
            placeholder="Search chapters..."
            value={chapterQuery}
            onChange={(e) => setChapterQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={chapterQuery ? <IconX size={14} className="cursor-pointer" onClick={() => setChapterQuery("")} /> : undefined}
          />

          <ScrollArea h={400}>
            {filteredChapters.length === 0 && chapterQuery && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No chapters match your search
              </Text>
            )}
            {filteredChapters.length === 0 && !chapterQuery && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                This book has no chapters yet
              </Text>
            )}
            <Stack gap="xs">
              {filteredChapters.map((ch, i) => {
                const globalIndex = chapters?.indexOf(ch) ?? i;
                const isCurrent = globalIndex === chapterIndex;
                const isBookmarked = bookmarks?.some((b) => b.chapterId === ch.id);
                return (
                  <Box
                    key={ch.id}
                    className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    onClick={() => { goToChapter(globalIndex); setChaptersOpen(false); }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={600}>
                          {isCurrent && <IconCheck size={14} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />}
                          {ch.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {ch.wordCount.toLocaleString()} words
                        </Text>
                      </Box>
                      {isBookmarked && (
                        <Text size="xs" c="yellow" style={{ flexShrink: 0 }}>Bookmarked</Text>
                      )}
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </Modal>
    </Box>
  );
}
