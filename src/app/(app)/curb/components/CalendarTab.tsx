"use client";

import { useState, useEffect, useCallback } from "react";
import { Paper, Text, Group, Stack, SimpleGrid, ActionIcon, Skeleton, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type DayData = {
  date: string;
  count: number;
  intensity: number;
};

type CalendarData = {
  year: number;
  month: number;
  days: DayData[];
  total: number;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensityColor(intensity: number): string {
  if (intensity === 0) return "bg-gray-50 dark:bg-white/[0.02]";
  if (intensity < 0.25) return "bg-green-200 dark:bg-green-900/40";
  if (intensity < 0.5) return "bg-yellow-200 dark:bg-yellow-900/40";
  if (intensity < 0.75) return "bg-orange-200 dark:bg-orange-900/40";
  return "bg-red-200 dark:bg-red-900/40";
}

function getIntensityTextColor(intensity: number): string {
  if (intensity === 0) return "text-gray-400 dark:text-gray-600";
  return "text-gray-900 dark:text-gray-100";
}

export function CalendarTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/curb/calendar?year=${year}&month=${month}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = data?.days.length ?? new Date(year, month, 0).getDate();
  const blanks = Array.from({ length: firstDay });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <ActionIcon variant="subtle" onClick={prevMonth}><IconChevronLeft size={18} /></ActionIcon>
        <Text size="lg" fw={700}>{MONTHS[month - 1]} {year}</Text>
        <ActionIcon variant="subtle" onClick={nextMonth}><IconChevronRight size={18} /></ActionIcon>
      </Group>

      {data && (
        <Text size="sm" c="dimmed" ta="center">
          Total: {data.total} occurrences ·{" "}
          {data.days.length > 0 && `Avg: ${(data.total / data.days.filter(d => d.date <= new Date().toISOString().slice(0, 10)).length || 1).toFixed(1)}/day`}
        </Text>
      )}

      {loading ? (
        <Skeleton height={300} radius="lg" />
      ) : (
        <Paper withBorder p="md" radius="lg">
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
            ))}
            {blanks.map((_, i) => <div key={`b-${i}`} />)}
            {data?.days.map((day) => {
              const isToday = day.date === new Date().toISOString().slice(0, 10);
              return (
                <Tooltip key={day.date} label={`${day.date}: ${day.count} occurrences`}>
                  <div
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer
                      transition-all hover:ring-2 hover:ring-blue-400
                      ${getIntensityColor(day.intensity)}
                      ${getIntensityTextColor(day.intensity)}
                      ${isToday ? "ring-2 ring-blue-500" : ""}
                    `}
                  >
                    {new Date(day.date).getDate()}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </Paper>
      )}

      <Paper withBorder p="md" radius="lg">
        <Text size="sm" fw={600} mb="sm">Legend</Text>
        <Group gap="md">
          <Group gap={4}>
            <div className="w-4 h-4 rounded bg-gray-50 dark:bg-white/[0.02]" />
            <Text size="xs" c="dimmed">None</Text>
          </Group>
          <Group gap={4}>
            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40" />
            <Text size="xs" c="dimmed">Low</Text>
          </Group>
          <Group gap={4}>
            <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/40" />
            <Text size="xs" c="dimmed">Moderate</Text>
          </Group>
          <Group gap={4}>
            <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-900/40" />
            <Text size="xs" c="dimmed">High</Text>
          </Group>
          <Group gap={4}>
            <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/40" />
            <Text size="xs" c="dimmed">Very High</Text>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
