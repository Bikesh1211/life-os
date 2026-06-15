"use client";

import { Stack, Group, Text, Badge, ThemeIcon, Paper, Box } from "@mantine/core";
import {
  IconCircleCheck,
  IconCircle,
  IconClock,
  IconPlayerPlay,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import type { ExecutionItem } from "@/hooks/use-today-routine";

type RoutineTimelineProps = {
  executionItems: ExecutionItem[];
  onStartItem?: (itemId: string) => void;
  onCompleteItem?: (itemId: string) => void;
  onSkipItem?: (itemId: string) => void;
  readonly?: boolean;
};

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "blue";
    case "skipped":
      return "gray";
    default:
      return "dark";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return IconCircleCheck;
    case "in_progress":
      return IconPlayerPlay;
    case "skipped":
      return IconCircle;
    default:
      return IconClock;
  }
}

export function RoutineTimeline({
  executionItems,
  onStartItem,
  onCompleteItem,
  onSkipItem,
  readonly = false,
}: RoutineTimelineProps) {
  const sorted = [...executionItems].sort((a, b) => {
    const aTime = a.routineItem?.startTime ?? a.plannedStart ?? "00:00";
    const bTime = b.routineItem?.startTime ?? b.plannedStart ?? "00:00";
    return aTime.localeCompare(bTime);
  });

  return (
    <Stack gap={0}>
      {sorted.map((item, index) => {
        const Icon = getStatusIcon(item.status);
        const color = getStatusColor(item.status);
        const isLast = index === sorted.length - 1;
        const now = dayjs();
        const itemStart = item.routineItem?.startTime ?? item.plannedStart ?? "";
        const [hours, minutes] = itemStart.split(":").map(Number);
        const itemDate = now.hour(hours).minute(minutes).second(0);
        const isPast = itemDate.isBefore(now);
        const isCurrent = item.status === "in_progress";
        const isUpcoming = item.status === "pending" && !isPast;

        return (
          <Box key={item.id} className="relative">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <Box className="flex flex-col items-center" style={{ minWidth: 24 }}>
                <ThemeIcon
                  variant={item.status === "in_progress" ? "filled" : "light"}
                  color={color}
                  size="sm"
                  radius="xl"
                  onClick={() => {
                    if (readonly) return;
                    if (item.status === "pending") onStartItem?.(item.id);
                    else if (item.status === "in_progress") onCompleteItem?.(item.id);
                  }}
                  style={{ cursor: readonly ? "default" : "pointer" }}
                >
                  <Icon size={12} />
                </ThemeIcon>
                {!isLast && (
                  <Box
                    className="w-px flex-1"
                    style={{
                      backgroundColor: "var(--mantine-color-dark-4)",
                      minHeight: 24,
                      width: 2,
                    }}
                  />
                )}
              </Box>

              <Box
                className="flex-1 pb-4"
                onClick={() => {
                  if (readonly) return;
                  if (item.status === "pending") onStartItem?.(item.id);
                }}
                style={{ cursor: readonly ? "default" : "pointer" }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Text
                    size="sm"
                    fw={isCurrent ? 700 : 500}
                    td={item.status === "completed" || item.status === "skipped" ? "line-through" : undefined}
                    c={item.status === "skipped" ? "dimmed" : undefined}
                  >
                    {item.routineItem?.title ?? "Unknown"}
                  </Text>
                  <Group gap={4} wrap="nowrap">
                    <Text size="xs" c="dimmed">
                      {item.routineItem?.startTime ?? item.plannedStart ?? ""}
                      {item.routineItem?.endTime ?? item.plannedEnd
                        ? ` - ${item.routineItem?.endTime ?? item.plannedEnd}`
                        : ""}
                    </Text>
                    {item.routineItem?.isOptional && (
                      <Badge size="xs" variant="outline" color="gray">
                        Optional
                      </Badge>
                    )}
                  </Group>
                </Group>
              </Box>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}
