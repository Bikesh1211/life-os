"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Stack, Group, Tooltip, ActionIcon, Text, Paper, Slider, Select } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { IconX, IconPalette, IconTypography } from "@tabler/icons-react";
import { BookPage, type ReaderTheme, READER_THEMES } from "./BookPage";
import type { BookPage as BookPageType } from "./useBookData";

const LS_THEME_KEY = "life-os:journal-reader-theme";
const LS_FONT_SIZE_KEY = "life-os:journal-reader-font-size";
const LS_LINE_HEIGHT_KEY = "life-os:journal-reader-line-height";
const LS_PAGE_WIDTH_KEY = "life-os:journal-reader-page-width";
const LS_FONT_FAMILY_KEY = "life-os:journal-reader-font-family";

const FONT_OPTIONS = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Lora, serif", label: "Lora" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "serif", label: "Serif" },
];

const THEME_ORDER: ReaderTheme[] = ["light", "sepia", "dark", "oled", "paper", "cream"];

type ReaderModeProps = {
  title: string;
  content: string;
  dateLabel?: string;
  onClose: () => void;
};

function readPref<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (raw as T) : fallback;
}

export function ReaderMode({ title, content, dateLabel, onClose }: ReaderModeProps) {
  const [theme, setTheme] = useState<ReaderTheme>(() => readPref(LS_THEME_KEY, "sepia"));
  const [fontSize, setFontSize] = useState<number>(() => Number(readPref(LS_FONT_SIZE_KEY, 16)) || 16);
  const [lineHeight, setLineHeight] = useState<number>(() => Number(readPref(LS_LINE_HEIGHT_KEY, 1.8)) || 1.8);
  const [pageWidth, setPageWidth] = useState<number>(() => Number(readPref(LS_PAGE_WIDTH_KEY, 720)) || 720);
  const [fontFamily, setFontFamily] = useState<string>(() => readPref(LS_FONT_FAMILY_KEY, "Georgia, serif"));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      localStorage.setItem(LS_THEME_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          if (settingsOpen) { setSettingsOpen(false); break; }
          onClose();
          break;
        case "t":
        case "T":
          cycleTheme();
          break;
        case "s":
        case "S":
          setSettingsOpen((v) => !v);
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settingsOpen, onClose, cycleTheme]);

  const colors = READER_THEMES[theme];
  const page = {
    type: "entry" as const,
    date: dateLabel ?? "",
    dateLabel: dateLabel ?? "",
    entries: [{ id: "reader-preview", title, content }],
  } as unknown as BookPageType;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        backgroundColor: colors.bg,
        transition: "background-color 0.3s ease",
      }}
      className="overflow-hidden"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
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
                <BookPage
                  page={page}
                  theme={theme}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  pageWidth={pageWidth}
                  fontFamily={fontFamily}
                />

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
                            <Tooltip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)}>
                              <Paper
                                withBorder={theme === t}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  backgroundColor: READER_THEMES[t].bg,
                                  cursor: "pointer",
                                  border: theme === t
                                    ? "2px solid var(--mantine-color-brand-filled)"
                                    : "1px solid var(--mantine-color-default-border)",
                                }}
                                onClick={() => {
                                  setTheme(t);
                                  localStorage.setItem(LS_THEME_KEY, t);
                                }}
                              />
                            </Tooltip>
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
        </motion.div>
      </AnimatePresence>

      <Box
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur-lg dark:bg-gray-950/90"
        style={{ borderColor: "var(--mantine-color-default-border)", margin: 0, padding: 0 }}
      >
        <Group justify="space-between" px="md" py="sm" wrap="nowrap">
          <Group gap={2} wrap="nowrap">
            <Tooltip label="Exit book view (Esc)">
              <ActionIcon variant="subtle" color="gray" size="md" onClick={onClose}>
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
            {dateLabel && (
              <Text size="sm" c="dimmed" className="truncate max-w-[300px]">
                {dateLabel}
              </Text>
            )}
          </Group>

          <Group gap={2} wrap="nowrap">
            <Tooltip label="Theme (T)">
              <ActionIcon variant="subtle" color="gray" size="md" onClick={cycleTheme}>
                <IconPalette size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Settings (S)">
              <ActionIcon variant="subtle" color="gray" size="md" onClick={() => setSettingsOpen((v) => !v)}>
                <IconTypography size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
