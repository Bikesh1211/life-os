"use client";

import { Group, ActionIcon, Tooltip, Text, Box } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconSortAscending,
  IconSortDescending,
  IconSearch,
  IconMaximize,
  IconMinimize,
  IconPalette,
  IconTypography,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";

type BookToolbarProps = {
  currentPage: number;
  totalPages: number;
  currentDateLabel: string;
  sortOrder: "asc" | "desc";
  searchOpen: boolean;
  fullscreen: boolean;
  hasBookmark: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleSearch: () => void;
  onToggleSort: () => void;
  onToggleFullscreen: () => void;
  onToggleTheme: () => void;
  onToggleSettings: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
};

export function BookToolbar({
  currentPage,
  totalPages,
  currentDateLabel,
  sortOrder,
  searchOpen,
  fullscreen,
  hasBookmark,
  onPrev,
  onNext,
  onToggleSearch,
  onToggleSort,
  onToggleFullscreen,
  onToggleTheme,
  onToggleSettings,
  onToggleBookmark,
  onClose,
}: BookToolbarProps) {
  return (
    <Box
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur-lg dark:bg-gray-950/90"
      style={{ borderColor: "var(--mantine-color-default-border)", margin: 0, padding: 0 }}
    >
      <Group justify="space-between" px="md" py="sm" wrap="nowrap">
        <Group gap={2} wrap="nowrap">
          <Tooltip label="Close (Esc)">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onClose}>
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Previous page (←)">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onPrev}>
              <IconArrowLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Next page (→)">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onNext}>
              <IconArrowRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ flex: 1, justifyContent: "center" }}>
          <Text size="sm" c="dimmed" className="truncate max-w-[300px]">
            {currentDateLabel}
          </Text>
          <Text size="xs" c="gray" className="opacity-50">
            {currentPage + 1} / {totalPages}
          </Text>
        </Group>

        <Group gap={2} wrap="nowrap">
          <Tooltip label={hasBookmark ? "Remove bookmark" : "Bookmark this page (B)"}>
            <ActionIcon
              variant={hasBookmark ? "filled" : "subtle"}
              color={hasBookmark ? "yellow" : "gray"}
              size="md"
              onClick={onToggleBookmark}
            >
              {hasBookmark ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Theme (T)">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onToggleTheme}>
              <IconPalette size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Settings (S)">
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onToggleSettings}>
              <IconTypography size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}>
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onToggleFullscreen}>
              {fullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label={sortOrder === "asc" ? "Oldest first" : "Newest first"}>
            <ActionIcon variant="subtle" color="gray" size="md" onClick={onToggleSort}>
              {sortOrder === "asc" ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Search">
            <ActionIcon variant={searchOpen ? "light" : "subtle"} color="gray" size="md" onClick={onToggleSearch}>
              <IconSearch size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}
