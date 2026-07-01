"use client";

import { Stack, Text, Group, Switch, Divider, Badge, Paper, Progress } from "@mantine/core";
import { IconClock, IconCalendar, IconPin, IconEyeOff, IconActivity } from "@tabler/icons-react";
import { MoodSelector } from "./MoodSelector";
import { TagInput } from "./TagInput";
import { formatDate, computeReadingTime, getMoodEmoji } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type JournalDetailPanelProps = {
  entry: Partial<JournalEntry> | null;
  isEditing: boolean;
  onMoodChange?: (mood: string | null) => void;
  onTagsChange?: (tags: string[]) => void;
  onPinToggle?: () => void;
  onPrivacyToggle?: () => void;
};

export function JournalDetailPanel({
  entry,
  isEditing,
  onMoodChange,
  onTagsChange,
  onPinToggle,
  onPrivacyToggle,
}: JournalDetailPanelProps) {
  if (!entry) return null;

  const wordCount = (entry.content ?? "").split(/\s+/).filter(Boolean).length;
  const readingTime = computeReadingTime(entry.content ?? "");

  return (
    <Paper
      p="md"
      radius="lg"
      className="h-full border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50"
    >
      <Stack gap="md">
        <Text size="sm" fw={600} c="dimmed">
          Details
        </Text>

        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Mood
          </Text>
          {isEditing && onMoodChange ? (
            <MoodSelector
              value={entry.mood ?? undefined}
              onChange={(mood) => onMoodChange(mood as string | null)}
            />
          ) : entry.mood ? (
            <Group gap="xs">
              <Text size="lg">{getMoodEmoji(entry.mood)}</Text>
              <Badge variant="light" size="sm">
                {entry.mood}
              </Badge>
            </Group>
          ) : (
            <Text size="xs" c="dimmed">
              — None
            </Text>
          )}
        </div>

        <Divider />

        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Tags
          </Text>
          {isEditing && onTagsChange ? (
            <TagInput
              value={entry.tags ?? []}
              onChange={onTagsChange}
            />
          ) : entry.tags && entry.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="light" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <Text size="xs" c="dimmed">
              — None
            </Text>
          )}
        </div>

        <Divider />

        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <IconCalendar size={14} className="shrink-0 text-gray-400" />
            <Text size="xs" c="dimmed">
              Created {formatDate(new Date(entry.createdAt ?? new Date()))}
            </Text>
          </Group>
          {entry.updatedAt && (
            <Group gap="xs" wrap="nowrap">
              <IconClock size={14} className="shrink-0 text-gray-400" />
              <Text size="xs" c="dimmed">
                Updated {formatDate(new Date(entry.updatedAt))}
              </Text>
            </Group>
          )}
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <IconActivity size={14} className="shrink-0 text-gray-400" />
            <Text size="xs" c="dimmed">
              {wordCount} words
            </Text>
          </Group>
          {wordCount > 0 && (
            <Group gap="xs" wrap="nowrap">
              <IconClock size={14} className="shrink-0 text-gray-400" />
              <Text size="xs" c="dimmed">
                {readingTime} min read
              </Text>
            </Group>
          )}
        </Stack>

        {entry.reflectionScore && (
          <>
            <Divider />
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Reflection Score
              </Text>
              <Group gap="xs">
                <Progress
                  value={entry.reflectionScore * 10}
                  size="sm"
                  color="violet"
                  className="flex-1"
                />
                <Text size="xs" fw={600}>
                  {entry.reflectionScore}/10
                </Text>
              </Group>
            </div>
          </>
        )}

        {isEditing && (
          <>
            <Divider />
            <Stack gap="sm">
              <Switch
                label="Pinned"
                size="xs"
                checked={entry.isPinned ?? false}
                onChange={onPinToggle}
                thumbIcon={
                  <IconPin size={10} className="block" />
                }
              />
              <Switch
                label="Private"
                size="xs"
                checked={entry.isPrivate ?? true}
                onChange={onPrivacyToggle}
                thumbIcon={
                  <IconEyeOff size={10} className="block" />
                }
              />
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
