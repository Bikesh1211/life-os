"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader, Center, Text, Box, Stack, Group, Tooltip, ActionIcon, Slider, Select, Switch, Button, Paper } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { IconX, IconSun, IconMoon } from "@tabler/icons-react";
import { useAppShell } from "@/app/(app)/AppShellProvider";
import { useBookData } from "./useBookData";
import { BookPage, type ReaderTheme, READER_THEMES } from "./BookPage";
import { BookToolbar } from "./BookToolbar";
import { SearchOverlay } from "./SearchOverlay";

const LS_THEME_KEY = "life-os:journal-reader-theme";
const LS_FONT_SIZE_KEY = "life-os:journal-reader-font-size";
const LS_LINE_HEIGHT_KEY = "life-os:journal-reader-line-height";
const LS_PAGE_WIDTH_KEY = "life-os:journal-reader-page-width";
const LS_FONT_FAMILY_KEY = "life-os:journal-reader-font-family";

type BookViewProps = {
  onClose: () => void;
};

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

export function BookView({ onClose }: BookViewProps) {
  const { pages, loading, error, sortOrder, toggleSortOrder, loadYear, loadedYears } = useBookData();
  const { setMinimalChrome } = useAppShell();
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();
  const [[pageIndex, direction], setPageIndex] = useState([0, 0]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [theme, setTheme] = useState<ReaderTheme>("sepia");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [pageWidth, setPageWidth] = useState(720);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
  const [bookmarkedEntries, setBookmarkedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTheme((localStorage.getItem(LS_THEME_KEY) as ReaderTheme) || "sepia");
    setFontSize(Number(localStorage.getItem(LS_FONT_SIZE_KEY)) || 16);
    setLineHeight(Number(localStorage.getItem(LS_LINE_HEIGHT_KEY)) || 1.8);
    setPageWidth(Number(localStorage.getItem(LS_PAGE_WIDTH_KEY)) || 720);
    const savedFont = localStorage.getItem(LS_FONT_FAMILY_KEY);
    if (savedFont) setFontFamily(savedFont);
  }, []);

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  const totalPages = pages.length;

  const paginate = useCallback(
    (newDirection: number) => {
      const next = pageIndex + newDirection;
      if (next < 0 || next >= totalPages) return;

      const targetPage = pages[next];
      if (targetPage?.type === "entry") {
        const year = parseInt(targetPage.date.slice(0, 4), 10);
        if (!loadedYears.includes(year)) loadYear(year);

        if (newDirection > 0 && next + 1 < totalPages) {
          const nextPage = pages[next + 1];
          if (nextPage?.type === "entry") {
            const nextYear = parseInt(nextPage.date.slice(0, 4), 10);
            if (nextYear !== year && !loadedYears.includes(nextYear)) loadYear(nextYear);
          }
        }
      }

      setPageIndex([next, newDirection]);
      setSettingsOpen(false);
    },
    [pageIndex, totalPages, pages, loadedYears, loadYear],
  );

  const jumpToDate = useCallback(
    (date: string) => {
      const idx = pages.findIndex((p) => p.type === "entry" && p.date === date);
      if (idx >= 0) {
        setPageIndex([idx, 1]);
        setSettingsOpen(false);
        const year = parseInt(date.slice(0, 4), 10);
        if (!loadedYears.includes(year)) loadYear(year);
      }
    },
    [pages, loadedYears, loadYear],
  );

  const handleToggleSort = useCallback(() => {
    toggleSortOrder();
    setPageIndex([0, 0]);
  }, [toggleSortOrder]);

  const handleToggleBookmark = useCallback(() => {
    const page = pages[pageIndex];
    if (page?.type !== "entry") return;
    setBookmarkedEntries((prev) => {
      const next = new Set(prev);
      const currentEntryIds = page.entries.map((e) => e.id);
      const hasAny = currentEntryIds.some((id) => next.has(id));
      if (hasAny) {
        currentEntryIds.forEach((id) => next.delete(id));
      } else {
        currentEntryIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [pages, pageIndex]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      localStorage.setItem(LS_THEME_KEY, next);
      return next;
    });
  }, []);

  const currentPageData = pages[pageIndex] ?? null;
  const currentPageIsBookmarked = currentPageData?.type === "entry"
    && currentPageData.entries.some((e) => bookmarkedEntries.has(e.id));

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (searchOpen) return;
      switch (e.key) {
        case "ArrowRight":
          paginate(1);
          break;
        case "ArrowLeft":
          paginate(-1);
          break;
        case "Home":
          setPageIndex([0, -1]);
          break;
        case "End":
          setPageIndex([totalPages - 1, 1]);
          break;
        case "Escape":
          if (settingsOpen) { setSettingsOpen(false); break; }
          onClose();
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
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, totalPages, searchOpen, onClose, toggleFullscreen, cycleTheme, settingsOpen, handleToggleBookmark]);

  const colors = READER_THEMES[theme];

  if (loading) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ position: "fixed", inset: 0, zIndex: 200 }} bg="var(--mantine-color-body)">
        <Text c="red" size="sm">{error}</Text>
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
      <div className="flex h-full items-center justify-center px-4 pb-16 pt-4">
        <div className="relative h-full w-full" style={{ maxWidth: pageWidth + 80 }}>
          <div
            className="relative h-full w-full overflow-hidden rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={pageIndex}
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
                <BookPage
                  page={currentPageData}
                  theme={theme}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  pageWidth={pageWidth}
                  fontFamily={fontFamily}
                />
              </motion.div>
            </AnimatePresence>

            {settingsOpen && (
              <Paper
                shadow="lg"
                withBorder
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 300,
                  zIndex: 50,
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
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

      <BookToolbar
        currentPage={pageIndex}
        totalPages={totalPages}
        currentDateLabel={
          currentPageData?.type === "entry" ? currentPageData.dateLabel : ""
        }
        sortOrder={sortOrder}
        searchOpen={searchOpen}
        fullscreen={fullscreen}
        hasBookmark={currentPageIsBookmarked}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onToggleSearch={() => setSearchOpen((p) => !p)}
        onToggleSort={handleToggleSort}
        onToggleFullscreen={toggleFullscreen}
        onToggleTheme={cycleTheme}
        onToggleSettings={() => setSettingsOpen((v) => !v)}
        onToggleBookmark={handleToggleBookmark}
        onClose={onClose}
      />

      <SearchOverlay
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        pages={pages}
        onJumpToDate={jumpToDate}
      />
    </Box>
  );
}
