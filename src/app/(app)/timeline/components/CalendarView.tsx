"use client";

import { useState, useMemo } from "react";
import { Paper, Stack, Text, Badge, Group, ThemeIcon, SimpleGrid, Box, rem } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconCoin,
  IconPlane,
  IconUsers,
  IconBuildingStore,
  IconPlayerPlay,
  IconStar,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import type { TimelineEvent } from "@/modules/timeline/repository";
import type { DurationBreakdown } from "@/modules/timeline";
import { cn } from "@/core/utils";
import dayjs from "dayjs";

const categoryIcons: Record<string, TablerIcon> = {
  personal: IconUser,
  career: IconBriefcase,
  education: IconSchool,
  health: IconHeart,
  finance: IconCoin,
  travel: IconPlane,
  relationships: IconUsers,
  business: IconBuildingStore,
  entertainment: IconPlayerPlay,
  custom: IconStar,
};

const categoryColors: Record<string, string> = {
  personal: "blue",
  career: "violet",
  education: "teal",
  health: "green",
  finance: "yellow",
  travel: "orange",
  relationships: "pink",
  business: "indigo",
  entertainment: "grape",
  custom: "gray",
};

type EventWithDuration = TimelineEvent & {
  duration: DurationBreakdown;
  nextOccurrence: Date | null;
};

type Props = {
  events: EventWithDuration[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ events }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf("month"));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventWithDuration[]>();
    for (const event of events) {
      const dateKey = dayjs(event.eventDate).format("YYYY-MM-DD");
      const existing = map.get(dateKey) ?? [];
      existing.push(event);
      map.set(dateKey, existing);
    }
    return map;
  }, [events]);

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    dayjs().format("YYYY-MM-DD"),
  );

  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf("month");
    const end = currentMonth.endOf("month");
    const startDay = start.day();
    const days: (dayjs.Dayjs | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      days.push(d);
    }

    return days;
  }, [currentMonth]);

  const selectedEvents = eventsByDate.get(selectedDateStr ?? "") ?? [];

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  return (
    <Stack gap="md">
      <Paper p="md" radius="md">
        <Group justify="space-between" mb="md">
          <IconChevronLeft
            size={18}
            onClick={prevMonth}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          />
          <Text fw={600} size="sm">
            {currentMonth.format("MMMM YYYY")}
          </Text>
          <IconChevronRight
            size={18}
            onClick={nextMonth}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
          />
        </Group>

        <SimpleGrid cols={7} spacing={0}>
          {WEEKDAYS.map((day) => (
            <Text
              key={day}
              size="xs"
              c="dimmed"
              fw={500}
              ta="center"
              pb={8}
              className="text-[11px]"
            >
              {day}
            </Text>
          ))}

          {calendarDays.map((d, idx) => {
            if (!d) {
              return <Box key={`empty-${idx}`} />;
            }

            const dateKey = d.format("YYYY-MM-DD");
            const dayEvents = eventsByDate.get(dateKey);
            const hasEvents = dayEvents && dayEvents.length > 0;
            const isToday = dayjs().isSame(d, "day");
            const isSelected = selectedDateStr === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDateStr(dateKey)}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center py-2 transition-colors duration-100",
                  isSelected && "rounded-md bg-blue-50 dark:bg-blue-900/20",
                  !isSelected && "hover:rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/30",
                )}
              >
                <span
                  className={cn(
                    "z-10 text-sm",
                    isToday && "font-bold text-blue-600",
                  )}
                >
                  {d.date()}
                </span>
                {hasEvents && (
                  <div className="mt-0.5 flex gap-[2px]">
                    {dayEvents!.slice(0, 4).map((ev) => (
                      <div
                        key={ev.id}
                        className="h-1 w-1 rounded-full"
                        style={{
                          backgroundColor: ev.color
                            ? ev.color
                            : `var(--mantine-color-${categoryColors[ev.category] ?? "gray"}-6)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </SimpleGrid>
      </Paper>

      {selectedEvents.length > 0 && (
        <Paper p="md" radius="md">
          <Text fw={600} size="sm" mb="sm">
            Events on{" "}
            {selectedDateStr
              ? dayjs(selectedDateStr).format("MMMM D, YYYY")
              : "selected date"}
          </Text>
          <Stack gap="xs">
            {selectedEvents.map((event) => {
              const CategoryIcon = categoryIcons[event.category] ?? IconStar;
              const catColor = categoryColors[event.category] ?? "gray";
              return (
                <Group key={event.id} gap="sm">
                  <ThemeIcon variant="light" size="sm" color={catColor}>
                    <CategoryIcon size={14} />
                  </ThemeIcon>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" fw={500} truncate>
                      {event.title}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {event.description ?? event.category}
                    </Text>
                  </div>
                  <Badge size="xs" color={catColor} variant="light">
                    {event.importance}
                  </Badge>
                </Group>
              );
            })}
          </Stack>
        </Paper>
      )}

      {selectedEvents.length === 0 && selectedDateStr && (
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed" ta="center">
            No events on this day
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
