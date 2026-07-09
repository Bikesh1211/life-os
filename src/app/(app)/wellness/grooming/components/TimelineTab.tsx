"use client";

import { Stack, Group, Text, Paper, Timeline, ThemeIcon, Badge } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  IconCircleCheck,
  IconCircleX,
  IconMinus,
  IconClock,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PageHeader } from "@/components/ui/page-header";

dayjs.extend(relativeTime);

export function TimelineTab() {
  const { data: activities } = useQuery({
    queryKey: ["wellness", "grooming", "activities"],
    queryFn: async () => {
      const res = await fetch("/api/wellness/grooming/activities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const list = activities ?? [];

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const todayItems = list.filter((a: any) => a.isCompletedToday);
  const yesterdayItems = list.filter((a: any) => {
    return false;
  });

  return (
    <Stack gap="lg">
      <PageHeader title="Grooming Timeline" subtitle="Your grooming activity history" />

      <Paper withBorder p="md" radius="lg">
        <Text fw={600} mb="md">Today</Text>
        {todayItems.length === 0 && (
          <Text c="dimmed" size="sm">No grooming activities completed today</Text>
        )}
        <Timeline active={todayItems.length} bulletSize={24} lineWidth={2}>
          {todayItems.map((item: any) => (
            <Timeline.Item
              key={item.id}
              bullet={<IconCircleCheck size={12} />}
              title={item.habit?.title}
            >
              <Text c="dimmed" size="xs">Completed today</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Paper>

      <Paper withBorder p="md" radius="lg">
        <Text fw={600} mb="md">Overdue & Upcoming</Text>
        <Stack gap="sm">
          {list.filter((a: any) => a.nextDueDate && a.nextDueDate < today && !a.isCompletedToday).slice(0, 5).map((item: any) => (
            <Group key={item.id}>
              <ThemeIcon color="red" variant="light" radius="xl" size="sm">
                <IconCircleX size={12} />
              </ThemeIcon>
              <Text size="sm">{item.habit?.title}</Text>
              <Badge color="red" size="sm">{dayjs(item.nextDueDate).fromNow()}</Badge>
            </Group>
          ))}
          {list.filter((a: any) => a.nextDueDate && a.nextDueDate >= today && !a.isCompletedToday).slice(0, 5).map((item: any) => (
            <Group key={item.id}>
              <ThemeIcon color="yellow" variant="light" radius="xl" size="sm">
                <IconClock size={12} />
              </ThemeIcon>
              <Text size="sm">{item.habit?.title}</Text>
              <Badge color="yellow" size="sm">Due {dayjs(item.nextDueDate).fromNow()}</Badge>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
