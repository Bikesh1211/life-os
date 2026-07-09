"use client";

import { useState } from "react";
import { Stack, Group, Text, Paper, SimpleGrid, Box, ActionIcon, ThemeIcon, Badge, Tooltip } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconChevronLeft, IconChevronRight, IconCircleCheck, IconCircleX, IconMinus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { PageHeader } from "@/components/ui/page-header";

function CalendarDay({ date, isToday, activityCount, completedCount, status }: { date: number; isToday: boolean; activityCount: number; completedCount: number; status: "all" | "partial" | "none" | "future" }) {
  const statusColor = status === "all" ? "green" : status === "partial" ? "yellow" : status === "none" ? "red" : "gray";

  return (
    <Tooltip label={`${completedCount}/${activityCount} completed`}>
      <Box
        style={{
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          backgroundColor: isToday ? "var(--mantine-color-blue-light)" : undefined,
          border: isToday ? "2px solid var(--mantine-color-blue-5)" : undefined,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: isToday ? 700 : 400,
        }}
      >
        <span>{date}</span>
        {status !== "future" && activityCount > 0 && (
          <ThemeIcon size="xs" radius="xl" color={statusColor} variant="filled" style={{ marginTop: 2 }}>
            {status === "all" ? <IconCircleCheck size={8} /> : status === "none" ? <IconCircleX size={8} /> : <IconMinus size={8} />}
          </ThemeIcon>
        )}
      </Box>
    </Tooltip>
  );
}

export function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const { data: activities } = useQuery({
    queryKey: ["wellness", "grooming", "activities"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/activities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const list = activities ?? [];
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day();

  const days: Array<{ date: number; isToday: boolean; activityCount: number; completedCount: number; status: "all" | "partial" | "none" | "future" }> = [];

  const today = dayjs().format("YYYY-MM-DD");

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = currentMonth.date(d).format("YYYY-MM-DD");
    const isToday = dateStr === today;
    const isFuture = dayjs(dateStr).isAfter(dayjs(), "day");

    const activityCount = list.length;
    const completedCount = list.filter((a: any) => a.isCompletedToday && dateStr === today).length;

    let status: "all" | "partial" | "none" | "future" = "future";
    if (isFuture) {
      status = "future";
    } else if (completedCount === 0) {
      status = "none";
    } else if (completedCount >= activityCount) {
      status = "all";
    } else {
      status = "partial";
    }

    days.push({ date: d, isToday, activityCount, completedCount, status });
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Stack gap="lg">
      <PageHeader title="Grooming Calendar" subtitle="Monthly overview of your grooming consistency" />

      <Paper withBorder p="md" radius="lg">
        <Group justify="space-between" mb="md">
          <ActionIcon variant="subtle" onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text fw={600}>{currentMonth.format("MMMM YYYY")}</Text>
          <ActionIcon variant="subtle" onClick={() => setCurrentMonth((m) => m.add(1, "month"))}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={7} spacing="xs">
          {weekDays.map((day) => (
            <Text key={day} size="xs" ta="center" fw={600} c="dimmed">{day}</Text>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <Box key={`empty-${i}`} />
          ))}
          {days.map((day) => (
            <CalendarDay key={day.date} {...day} />
          ))}
        </SimpleGrid>

        <Group mt="md" gap="xs">
          <Group gap={4}>
            <ThemeIcon size="xs" radius="xl" color="green" variant="filled"><IconCircleCheck size={8} /></ThemeIcon>
            <Text size="xs">Completed</Text>
          </Group>
          <Group gap={4}>
            <ThemeIcon size="xs" radius="xl" color="yellow" variant="filled"><IconMinus size={8} /></ThemeIcon>
            <Text size="xs">Partial</Text>
          </Group>
          <Group gap={4}>
            <ThemeIcon size="xs" radius="xl" color="red" variant="filled"><IconCircleX size={8} /></ThemeIcon>
            <Text size="xs">Missed</Text>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
