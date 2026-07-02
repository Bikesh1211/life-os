"use client";

import { useMemo, useCallback } from "react";
import { Paper, Text, Badge, Tooltip, ActionIcon, Group } from "@mantine/core";
import {
  IconPlayerPlay,
  IconSquareCheck,
  IconSquare,
  IconX,
  IconClock,
  IconGripVertical,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useUpdateItemStatus } from "@/hooks/use-day-plan";
import type { DayPlanItem } from "@/hooks/use-day-plan";

type CalendarGridProps = {
  items: DayPlanItem[];
  date: string;
  onItemsChange: () => void;
};

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2;
const TOTAL_HOURS = END_HOUR - START_HOUR;

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

function getMinutesSinceMidnight(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getMinutesSinceStart(time: string): number {
  return getMinutesSinceMidnight(time) - START_HOUR * 60;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function CalendarGrid({ items, date, onItemsChange }: CalendarGridProps) {
  const updateStatus = useUpdateItemStatus();

  const currentTimePosition = useMemo(() => {
    const now = dayjs();
    if (date !== now.format("YYYY-MM-DD")) return null;
    const minutes = now.hour() * 60 + now.minute();
    const fromStart = minutes - START_HOUR * 60;
    return fromStart;
  }, [date]);

  const handleStatusChange = useCallback(
    (item: DayPlanItem, newStatus: "in_progress" | "completed" | "skipped") => {
      updateStatus.mutate(
        { id: item.id, date, status: newStatus },
        { onSuccess: () => onItemsChange() },
      );
    },
    [date, updateStatus, onItemsChange],
  );

  const hourSlots = useMemo(() => {
    const slots = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      slots.push(h);
    }
    return slots;
  }, []);

  return (
    <Paper withBorder radius="md" className="relative overflow-hidden">
      <div className="relative">
        {/* Time labels column + grid */}
        <div className="flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 border-r border-[var(--border-subtle)]">
            {hourSlots.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="flex items-start justify-center border-b border-[var(--border-subtle)] pt-1"
              >
                <Text size="xs" c="dimmed" className="leading-none">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </Text>
              </div>
            ))}
          </div>

          {/* Grid area */}
          <div className="relative flex-1">
            {/* Hour lines */}
            {hourSlots.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-[var(--border-subtle)]"
              >
                {/* Half-hour marker */}
                <div
                  style={{ height: HALF_HOUR_HEIGHT }}
                  className="border-b border-dashed border-[var(--border-subtle)]"
                />
              </div>
            ))}

            {/* Current time indicator */}
            {currentTimePosition !== null && currentTimePosition >= 0 && currentTimePosition <= TOTAL_HOURS * 60 && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: (currentTimePosition / 60) * HOUR_HEIGHT }}
              >
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-px flex-1 bg-red-500" />
              </div>
            )}

            {/* Event blocks */}
            {items.map((item) => {
              const startMinutes = getMinutesSinceStart(item.startTime);
              const endMinutes = item.endTime
                ? getMinutesSinceStart(item.endTime)
                : startMinutes + 30;
              const top = (startMinutes / 60) * HOUR_HEIGHT;
              const height = Math.max(
                ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT,
                20,
              );

              const categoryColor = getCategoryColor(item.category);
              const isPast = dayjs(`${date} ${item.endTime || item.startTime}`, "YYYY-MM-DD HH:mm").isBefore(dayjs());

              return (
                <Tooltip
                  key={item.id}
                  position="left"
                  offset={10}
                  label={
                    <div className="max-w-xs">
                      <Text fw={600} size="sm">{item.title}</Text>
                      {item.description && <Text size="xs" c="dimmed">{item.description}</Text>}
                      <Text size="xs" mt={2}>
                        {formatTime(item.startTime)}
                        {item.endTime && ` – ${formatTime(item.endTime)}`}
                      </Text>
                      {item.location && <Text size="xs" c="dimmed">{item.location}</Text>}
                    </div>
                  }
                >
                  <div
                    className="absolute left-1 right-1 z-10 cursor-pointer overflow-hidden rounded-md border-l-4 px-2 py-1 transition-opacity hover:opacity-90"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: `var(--mantine-color-${categoryColor}-light)`,
                      borderLeftColor: `var(--mantine-color-${categoryColor}-filled)`,
                      opacity: item.status === "completed" ? 0.6 : 1,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <Group gap={4} wrap="nowrap" className="min-w-0">
                          <Text size="xs" fw={600} lineClamp={1} className="flex-1">
                            {item.title}
                          </Text>
                          {item.priority === "high" && (
                            <Text size="xs" c="red">●</Text>
                          )}
                        </Group>
                      </div>
                      <div className="flex items-center justify-between">
                        <Group gap={2}>
                          {item.status !== "completed" && item.status !== "skipped" && (
                            <>
                              {item.status !== "in_progress" && (
                                <ActionIcon
                                  variant="transparent"
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(item, "in_progress");
                                  }}
                                >
                                  <IconPlayerPlay size={10} />
                                </ActionIcon>
                              )}
                              <ActionIcon
                                variant="transparent"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item, "completed");
                                }}
                              >
                                <IconSquareCheck size={10} />
                              </ActionIcon>
                            </>
                          )}
                        </Group>
                        <Group gap={2}>
                          {item.category && (
                            <Badge
                              size="xs"
                              color={categoryColor}
                              variant="dot"
                              className="max-w-16 truncate"
                            >
                              {item.category}
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed">
                            {formatTime(item.startTime)}
                          </Text>
                        </Group>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </Paper>
  );
}
