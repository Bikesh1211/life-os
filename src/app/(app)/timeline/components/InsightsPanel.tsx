"use client";

import { useMemo } from "react";
import {
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Group,
  ThemeIcon,
  Badge,
  Button,
  rem,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconHistory,
  IconClock,
  IconChartBar,
  IconStar,
  IconTarget,
  IconFlame,
  IconPlus,
} from "@tabler/icons-react";
import type { TimelineEvent } from "@/modules/timeline/repository";
import { computeDuration, getPrimaryUnit, type DurationBreakdown } from "@/modules/timeline/utils";
import dayjs from "dayjs";

type EventWithDuration = TimelineEvent & {
  duration: DurationBreakdown;
  nextOccurrence: Date | null;
};

type Props = {
  events: EventWithDuration[];
  onCreateClick: () => void;
};

type StatCard = {
  label: string;
  value: string | number;
  icon: typeof IconStar;
  color: string;
  subtitle?: string;
};

export function InsightsPanel({ events, onCreateClick }: Props) {
  const now = dayjs();

  const stats = useMemo<StatCard[]>(() => {
    const total = events.length;
    const past = events.filter((e) => {
      const date = e.nextOccurrence ?? e.eventDate;
      return dayjs(date).isBefore(now);
    }).length;
    const future = events.filter((e) => {
      const date = e.nextOccurrence ?? e.eventDate;
      return dayjs(date).isAfter(now) || dayjs(date).isSame(now, "day");
    }).length;
    const pinned = events.filter((e) => e.isPinned).length;

    const upcoming = [...events]
      .filter((e) => {
        const date = e.nextOccurrence ?? e.eventDate;
        return dayjs(date).isAfter(now);
      })
      .sort(
        (a, b) =>
          new Date(a.nextOccurrence ?? a.eventDate).getTime() -
          new Date(b.nextOccurrence ?? b.eventDate).getTime(),
      );

    const longestRunning = [...events]
      .filter((e) => {
        const date = e.nextOccurrence ?? e.eventDate;
        return dayjs(date).isBefore(now);
      })
      .sort(
        (a, b) =>
          Math.abs(
            new Date(a.nextOccurrence ?? a.eventDate).getTime() - now.valueOf(),
          ) -
          Math.abs(
            new Date(b.nextOccurrence ?? b.eventDate).getTime() - now.valueOf(),
          ),
      )
      .reverse();

    const thisMonth = events.filter((e) => {
      const date = e.nextOccurrence ?? e.eventDate;
      return dayjs(date).isSame(now, "month");
    });

    const thisYear = events.filter((e) => {
      const date = e.nextOccurrence ?? e.eventDate;
      return dayjs(date).isSame(now, "year");
    });

    const cards: StatCard[] = [
      {
        label: "Total Events",
        value: total,
        icon: IconChartBar,
        color: "blue",
      },
      {
        label: "Past Events",
        value: past,
        icon: IconHistory,
        color: "violet",
      },
      {
        label: "Upcoming",
        value: future,
        icon: IconClock,
        color: "green",
      },
      {
        label: "Pinned",
        value: pinned,
        icon: IconStar,
        color: "yellow",
      },
      {
        label: "This Month",
        value: thisMonth.length,
        icon: IconCalendarEvent,
        color: "cyan",
      },
      {
        label: "This Year",
        value: thisYear.length,
        icon: IconTarget,
        color: "indigo",
      },
    ];

    return cards;
  }, [events, now]);

  const nextEvent = useMemo(() => {
    return [...events]
      .filter((e) => {
        const date = e.nextOccurrence ?? e.eventDate;
        return dayjs(date).isAfter(now);
      })
      .sort(
        (a, b) =>
          new Date(a.nextOccurrence ?? a.eventDate).getTime() -
          new Date(b.nextOccurrence ?? b.eventDate).getTime(),
      )[0] ?? null;
  }, [events, now]);

  const longestPast = useMemo(() => {
    return [...events]
      .filter((e) => {
        const date = e.nextOccurrence ?? e.eventDate;
        return dayjs(date).isBefore(now);
      })
      .sort(
        (a, b) =>
          new Date(a.nextOccurrence ?? a.eventDate).getTime() -
          new Date(b.nextOccurrence ?? b.eventDate).getTime(),
      )[0] ?? null;
  }, [events, now]);

  const todayEvents = useMemo(() => {
    return events.filter((e) => {
      const date = e.nextOccurrence ?? e.eventDate;
      return dayjs(date).isSame(now, "day");
    });
  }, [events, now]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <IconChartBar size={48} stroke={1.5} className="mb-4 opacity-40" />
        <p className="text-sm mb-4">
          No data to analyze yet. Create your first event!
        </p>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateClick}
          size="sm"
        >
          Create Event
        </Button>
      </div>
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
        {stats.map((card) => (
          <Paper key={card.label} p="md" radius="md">
            <Group gap="sm" mb={4}>
              <ThemeIcon variant="light" size="md" color={card.color}>
                <card.icon size={18} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                {card.label}
              </Text>
            </Group>
            <Text fw={700} size="28px" className="tabular-nums">
              {card.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {nextEvent && (
          <Paper p="md" radius="md">
            <Group gap="sm" mb="xs">
              <IconClock size={16} className="text-green-600" />
              <Text fw={600} size="sm">
                Next Upcoming
              </Text>
            </Group>
            <Text fw={700} size="xl">
              {nextEvent.title}
            </Text>
            <Text size="sm" c="dimmed">
              {dayjs(nextEvent.nextOccurrence ?? nextEvent.eventDate).format(
                "MMM D, YYYY",
              )}
            </Text>
            <Badge size="sm" variant="light" color="green" mt={4}>
              {computeDuration(
                nextEvent.nextOccurrence ?? nextEvent.eventDate,
              ).totalDays > 0
                ? `${computeDuration(nextEvent.nextOccurrence ?? nextEvent.eventDate).totalDays} days away`
                : "Today"}
            </Badge>
          </Paper>
        )}

        {longestPast && (
          <Paper p="md" radius="md">
            <Group gap="sm" mb="xs">
              <IconFlame size={16} className="text-orange-600" />
              <Text fw={600} size="sm">
                Longest Running
              </Text>
            </Group>
            <Text fw={700} size="xl">
              {longestPast.title}
            </Text>
            <Text size="sm" c="dimmed">
              {dayjs(
                longestPast.nextOccurrence ?? longestPast.eventDate,
              ).format("MMM D, YYYY")}
            </Text>
            <Badge size="sm" variant="light" color="orange" mt={4}>
              {computeDuration(
                longestPast.nextOccurrence ?? longestPast.eventDate,
              ).totalDays > 0
                ? `${computeDuration(longestPast.nextOccurrence ?? longestPast.eventDate).totalDays} days ago`
                : "Today"}
            </Badge>
          </Paper>
        )}
      </div>

      {todayEvents.length > 0 && (
        <Paper p="md" radius="md">
          <Group gap="sm" mb="sm">
            <IconStar size={16} className="text-yellow-600" />
            <Text fw={600} size="sm">
              Today in Your Life
            </Text>
          </Group>
          <Stack gap="xs">
            {todayEvents.map((event) => {
              const duration = computeDuration(event.eventDate);
              const primary = getPrimaryUnit(duration);
              return (
                <Group key={event.id} gap="sm">
                  <Text size="sm" fw={500}>
                    {event.title}
                  </Text>
                  <Badge size="sm" variant="light" color="yellow">
                    {primary.value} {primary.unit} {primary.label.toLowerCase()}
                  </Badge>
                </Group>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
