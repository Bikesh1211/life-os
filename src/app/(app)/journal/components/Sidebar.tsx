"use client";

import { useState } from "react";
import { Stack, TextInput, Text, Group, Badge, Box, ActionIcon, Tooltip, Kbd } from "@mantine/core";
import { IconSearch, IconPin, IconEyeOff, IconX, IconPlus, IconTags, IconClock } from "@tabler/icons-react";
import type { JournalEntry } from "@/modules/journal";

type SidebarProps = {
  entries: JournalEntry[];
  tagCounts: Map<string, number>;
  activeFilter: "all" | "pinned" | "private" | string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFilterChange: (filter: string) => void;
  onTagClick: (tag: string) => void;
  selectedTag: string | null;
  onNewJournal: () => void;
};

export function Sidebar({
  entries,
  tagCounts,
  activeFilter,
  searchQuery,
  onSearchChange,
  onFilterChange,
  onTagClick,
  selectedTag,
  onNewJournal,
}: SidebarProps) {
  const recentEntries = entries.slice(0, 5);

  return (
    <Stack gap="xs" className="h-full">
      <div className="flex items-center justify-between">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          Collections
        </Text>
        <Tooltip label="New Journal" withArrow position="right">
          <ActionIcon variant="subtle" size="sm" onClick={onNewJournal}>
            <IconPlus size={14} />
          </ActionIcon>
        </Tooltip>
      </div>

      <TextInput
        placeholder="Search entries..."
        leftSection={<IconSearch size={14} />}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        size="xs"
        rightSection={
          searchQuery ? (
            <ActionIcon variant="subtle" size="xs" onClick={() => onSearchChange("")}>
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
      />

      <Box
        className="rounded-lg border border-gray-100 p-1 dark:border-gray-800"
      >
        <Stack gap={2}>
          <FilterRow
            icon={null}
            label="All Entries"
            count={entries.length}
            isActive={activeFilter === "all"}
            onClick={() => onFilterChange("all")}
          />
          <FilterRow
            icon={<IconPin size={12} />}
            label="Pinned"
            count={entries.filter((e) => e.isPinned).length}
            isActive={activeFilter === "pinned"}
            onClick={() => onFilterChange("pinned")}
          />
          <FilterRow
            icon={<IconEyeOff size={12} />}
            label="Private"
            count={entries.filter((e) => e.isPrivate).length}
            isActive={activeFilter === "private"}
            onClick={() => onFilterChange("private")}
          />
        </Stack>
      </Box>

      {tagCounts.size > 0 && (
        <>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" mt="xs">
            <Group gap={4}>
              <IconTags size={12} />
              Tags
            </Group>
          </Text>

          <div className="flex flex-wrap gap-1">
            {Array.from(tagCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 15)
              .map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                    selectedTag === tag
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {tag}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              ))}
          </div>
        </>
      )}

      {recentEntries.length > 0 && (
        <>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" mt="xs">
            <Group gap={4}>
              <IconClock size={12} />
              Recent
            </Group>
          </Text>

          <Stack gap={2}>
            {recentEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onTagClick(entry.id)}
                className="w-full truncate rounded-md px-2 py-1 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {entry.title}
              </button>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}

function FilterRow({
  icon,
  label,
  count,
  isActive,
  onClick,
}: {
  icon: React.ReactNode | null;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 text-left font-medium">{label}</span>
      <Badge size="xs" variant="filled" color={isActive ? "blue" : "gray"}>
        {count}
      </Badge>
    </button>
  );
}
