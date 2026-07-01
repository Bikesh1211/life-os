"use client";

import { useState, useMemo } from "react";
import { Paper, Stack, Text, Group, SimpleGrid, Box } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import dayjs from "dayjs";
import { getMoodEmoji, getMoodColor } from "@/modules/journal/utils";
import type { JournalEntry } from "@/modules/journal";

type Props = {
  entries: JournalEntry[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ entries }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf("month"));

  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const dateKey = dayjs(entry.eventDate ?? entry.createdAt).format("YYYY-MM-DD");
      const existing = map.get(dateKey) ?? [];
      existing.push(entry);
      map.set(dateKey, existing);
    }
    return map;
  }, [entries]);

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

  const selectedEntries = entriesByDate.get(selectedDateStr ?? "") ?? [];

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
            >
              {day}
            </Text>
          ))}

          {calendarDays.map((d, idx) => {
            if (!d) {
              return <Box key={`empty-${idx}`} />;
            }

            const dateKey = d.format("YYYY-MM-DD");
            const dayEntries = entriesByDate.get(dateKey);
            const hasEntries = dayEntries && dayEntries.length > 0;
            const isToday = dayjs().isSame(d, "day");
            const isSelected = selectedDateStr === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDateStr(dateKey)}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center justify-center py-2 transition-colors duration-100",
                  isSelected && "rounded-md bg-violet-50 dark:bg-violet-900/20",
                  !isSelected && "hover:rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/30",
                )}
              >
                <span
                  className={cn(
                    "z-10 text-sm",
                    isToday && "font-bold text-violet-600",
                  )}
                >
                  {d.date()}
                </span>
                {hasEntries && (
                  <div className="mt-0.5 flex gap-[2px]">
                    {dayEntries!.slice(0, 4).map((entry) => (
                      <div
                        key={entry.id}
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: entry.mood ? getMoodColor(entry.mood) : "var(--mantine-color-gray-4)" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </SimpleGrid>
      </Paper>

      {selectedEntries.length > 0 && (
        <Paper p="md" radius="md">
          <Text fw={600} size="sm" mb="sm">
            Entries on{" "}
            {selectedDateStr
              ? dayjs(selectedDateStr).format("MMMM D, YYYY")
              : "selected date"}
          </Text>
          <Stack gap="xs">
            {selectedEntries.map((entry) => (
              <Group key={entry.id} gap="sm">
                <Text size="lg">{entry.mood ? getMoodEmoji(entry.mood) : "📝"}</Text>
                <div className="min-w-0 flex-1">
                  <Text size="sm" fw={500} truncate>
                    {entry.title}
                  </Text>
                  {entry.content && (
                    <Text size="xs" c="dimmed" truncate>
                      {entry.content}
                    </Text>
                  )}
                </div>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      {selectedEntries.length === 0 && selectedDateStr && (
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed" ta="center">
            No entries on this day
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
