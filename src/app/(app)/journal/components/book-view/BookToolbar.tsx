"use client";

import { Group, ActionIcon, Tooltip, Text, Progress, Box } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconSearch,
  IconWriting,
  IconArrowsMaximize,
  IconBookmark,
  IconChartBar,
  IconX,
} from "@tabler/icons-react";
import type { BookPage as BookPageType } from "./useBookData";

type BookToolbarProps = {
  currentPage: number;
  totalPages: number;
  progress: number;
  currentPageData: BookPageType | null;
  handwritten: boolean;
  isFullscreen: boolean;
  searchOpen: boolean;
  timelineOpen: boolean;
  statsOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleSearch: () => void;
  onToggleHandwritten: () => void;
  onToggleFullscreen: () => void;
  onToggleTimeline: () => void;
  onToggleStats: () => void;
  onClose: () => void;
};

export function BookToolbar({
  currentPage,
  totalPages,
  progress,
  currentPageData,
  handwritten,
  searchOpen,
  timelineOpen,
  statsOpen,
  onPrev,
  onNext,
  onToggleSearch,
  onToggleHandwritten,
  onToggleFullscreen,
  onToggleTimeline,
  onToggleStats,
  onClose,
}: BookToolbarProps) {
  const dateLabel =
    currentPageData?.type === "entry"
      ? currentPageData.dateLabel
      : currentPageData?.type === "cover"
        ? "Cover"
        : "The End";

  return (
    <Box
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80"
      style={{ margin: 0, padding: 0 }}
    >
      <Progress value={progress * 100} size={2} color="gray" className="absolute top-0 left-0 right-0" />
      <Group justify="space-between" px="md" py="xs" wrap="nowrap">
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Close Book View">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Previous page">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onPrev}>
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ flex: 1, justifyContent: "center" }}>
          <Text size="xs" c="dimmed" className="hidden sm:block truncate max-w-[200px]">
            {dateLabel}
          </Text>
          <Text size="xs" c="dimmed">
            Page {currentPage + 1} / {totalPages}
          </Text>
        </Group>

        <Group gap={4} wrap="nowrap">
          <Tooltip label="Search">
            <ActionIcon variant={searchOpen ? "filled" : "subtle"} color="gray" size="sm" onClick={onToggleSearch}>
              <IconSearch size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={handwritten ? "Normal font" : "Handwritten font"}>
            <ActionIcon variant={handwritten ? "filled" : "subtle"} color="gray" size="sm" onClick={onToggleHandwritten}>
              <IconWriting size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Timeline">
            <ActionIcon variant={timelineOpen ? "filled" : "subtle"} color="gray" size="sm" onClick={onToggleTimeline}>
              <IconBookmark size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Statistics">
            <ActionIcon variant={statsOpen ? "filled" : "subtle"} color="gray" size="sm" onClick={onToggleStats}>
              <IconChartBar size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Fullscreen">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onToggleFullscreen}>
              <IconArrowsMaximize size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Next page">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onNext}>
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}
