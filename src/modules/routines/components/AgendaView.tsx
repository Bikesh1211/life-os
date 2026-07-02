"use client";

import { useMemo, useCallback } from "react";
import { Paper, Group, Text, Badge, ActionIcon, Checkbox, Stack } from "@mantine/core";
import {
  IconPlayerPlay,
  IconSquareCheck,
  IconClock,
  IconMapPin,
  IconChevronRight,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateItemStatus } from "@/hooks/use-day-plan";
import type { DayPlanItem } from "@/hooks/use-day-plan";

type AgendaViewProps = {
  items: DayPlanItem[];
  date: string;
  onItemsChange: () => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  personal: "grape",
  career: "blue",
  education: "cyan",
  health: "green",
  finance: "teal",
  travel: "yellow",
  relationships: "pink",
  business: "indigo",
  entertainment: "orange",
  custom: "gray",
};

function getCategoryColor(category: string | null): string {
  if (!category) return "gray";
  return CATEGORY_COLORS[category] ?? "gray";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getDurationMinutes(startTime: string, endTime: string | null): number {
  if (!endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(time: string): TimeOfDay {
  const hour = Number(time.split(":")[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

type GroupedItems = Record<TimeOfDay, DayPlanItem[]>;

const GROUP_LABELS: Record<TimeOfDay, { label: string; time: string }> = {
  morning: { label: "Morning", time: "06:00 – 11:59" },
  afternoon: { label: "Afternoon", time: "12:00 – 16:59" },
  evening: { label: "Evening", time: "17:00 – 21:59" },
};

const GROUP_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening"];

export function AgendaView({ items, date, onItemsChange }: AgendaViewProps) {
  const updateStatus = useUpdateItemStatus();

  const handleStatusChange = useCallback(
    (item: DayPlanItem, newStatus: "in_progress" | "completed" | "skipped") => {
      updateStatus.mutate(
        { id: item.id, date, status: newStatus },
        { onSuccess: () => onItemsChange() },
      );
    },
    [date, updateStatus, onItemsChange],
  );

  const groupedItems = useMemo(() => {
    const groups: GroupedItems = { morning: [], afternoon: [], evening: [] };
    for (const item of items) {
      const tod = getTimeOfDay(item.startTime);
      groups[tod].push(item);
    }
    for (const key of GROUP_ORDER) {
      groups[key].sort((a, b) => {
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return a.order - b.order;
      });
    }
    return groups;
  }, [items]);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const totalCount = items.length;

  if (items.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6)]">
          <IconClock size={28} className="text-[var(--mantine-color-dimmed)]" />
        </div>
        <Text size="sm" c="dimmed">No activities planned for this day.</Text>
        <Text size="xs" c="dimmed" mt={4}>
          Use the quick add bar above to plan your day.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Progress summary */}
      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {completedCount} of {totalCount} activities completed
          </Text>
          <Badge
            size="lg"
            color={completedCount === totalCount ? "green" : "blue"}
            variant="light"
          >
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </Badge>
        </Group>
      </Paper>

      <AnimatePresence mode="popLayout">
        {GROUP_ORDER.map((tod) => {
          const groupItems = groupedItems[tod];
          if (groupItems.length === 0) return null;
          const { label, time } = GROUP_LABELS[tod];
          const groupCompleted = groupItems.filter((i) => i.status === "completed").length;

          return (
            <motion.div
              key={tod}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Paper withBorder radius="md" className="overflow-hidden">
                <div className="border-b border-[var(--border-subtle)] bg-[var(--mantine-color-dark-7)] px-4 py-2">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Text size="sm" fw={600}>{label}</Text>
                      <Text size="xs" c="dimmed">{time}</Text>
                    </Group>
                    <Badge size="sm" variant="light" color="gray">
                      {groupCompleted}/{groupItems.length}
                    </Badge>
                  </Group>
                </div>

                <Stack gap={0}>
                  {groupItems.map((item) => {
                    const categoryColor = getCategoryColor(item.category);
                    const isCompleted = item.status === "completed";
                    const isInProgress = item.status === "in_progress";
                    const duration = getDurationMinutes(item.startTime, item.endTime);

                    return (
                      <div
                        key={item.id}
                        className={`border-b border-[var(--border-subtle)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--mantine-color-dark-6)] ${
                          isCompleted ? "opacity-60" : ""
                        } ${isInProgress ? "border-l-2 border-l-blue-500" : ""}`}
                      >
                        <Group gap="sm" wrap="nowrap" align="flex-start">
                          <Checkbox
                            checked={isCompleted}
              onChange={() =>
                handleStatusChange(item, isCompleted ? "in_progress" : "completed")
              }
                            mt={2}
                            size="sm"
                          />

                          <div className="min-w-0 flex-1">
                            <Group gap="xs" wrap="nowrap">
                              <Text
                                size="sm"
                                fw={500}
                                className={isCompleted ? "line-through" : ""}
                                lineClamp={1}
                              >
                                {item.title}
                              </Text>
                              {item.priority === "high" && !isCompleted && (
                                <Badge size="xs" color="red" variant="filled" className="shrink-0">
                                  High
                                </Badge>
                              )}
                            </Group>

                            <Group gap="xs" mt={2} wrap="wrap">
                              <Text size="xs" c="dimmed" className="flex items-center gap-1">
                                <IconClock size={10} />
                                {formatTime(item.startTime)}
                                {item.endTime && ` – ${formatTime(item.endTime)}`}
                              </Text>

                              {duration > 0 && (
                                <Badge size="xs" variant="light" color="gray">
                                  {formatDuration(duration)}
                                </Badge>
                              )}

                              {item.category && (
                                <Badge size="xs" color={categoryColor} variant="dot">
                                  {item.category}
                                </Badge>
                              )}

                              {item.location && (
                                <Text size="xs" c="dimmed" className="flex items-center gap-1">
                                  <IconMapPin size={10} />
                                  {item.location}
                                </Text>
                              )}

                              {item.routineName && (
                                <Badge size="xs" variant="light" color="gray">
                                  {item.routineName}
                                </Badge>
                              )}
                            </Group>
                          </div>

                          <Group gap={2} wrap="nowrap" className="shrink-0">
                            {!isCompleted && item.status !== "skipped" && (
                              <>
                                {!isInProgress && (
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => handleStatusChange(item, "in_progress")}
                                  >
                                    <IconPlayerPlay size={14} />
                                  </ActionIcon>
                                )}
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  color="gray"
                                  onClick={() => handleStatusChange(item, "skipped")}
                                >
                                  <IconSquareCheck size={14} />
                                </ActionIcon>
                              </>
                            )}
                          </Group>
                        </Group>
                      </div>
                    );
                  })}
                </Stack>
              </Paper>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Stack>
  );
}
