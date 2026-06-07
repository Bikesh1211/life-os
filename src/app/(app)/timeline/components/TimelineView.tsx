"use client";

import { useMemo } from "react";
import { Box, Text, Badge, Group, ThemeIcon, Paper, rem } from "@mantine/core";
import {
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
import { computeDuration, getPrimaryUnit, type DurationBreakdown } from "@/modules/timeline/utils";
import type { TimelineEvent } from "@/modules/timeline/repository";
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
  onEdit: (event: EventWithDuration) => void;
  onDeleted: (id: string) => void;
};

function TimelineEntry({
  event,
  side,
}: {
  event: EventWithDuration;
  side: "left" | "right";
}) {
  const duration = computeDuration(
    event.nextOccurrence ?? event.eventDate,
  );
  const primary = getPrimaryUnit(duration);
  const CategoryIcon = categoryIcons[event.category] ?? IconStar;
  const catColor = categoryColors[event.category] ?? "gray";
  const dateStr = dayjs(event.eventDate).format("MMM D, YYYY");

  return (
    <div
      className={`relative flex w-full items-start ${
        side === "left" ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <div className="flex-1 px-4">
        <Paper
          p="sm"
          radius="md"
          className="transition-all duration-150 hover:shadow-sm"
          style={{
            borderLeft:
              side === "left"
                ? `3px solid var(--mantine-color-${catColor}-6)`
                : undefined,
            borderRight:
              side === "right"
                ? `3px solid var(--mantine-color-${catColor}-6)`
                : undefined,
          }}
        >
          <Group gap="xs" mb={4}>
            <ThemeIcon variant="light" size="sm" color={catColor}>
              <CategoryIcon size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              {event.title}
            </Text>
            <Badge size="xs" variant="light" color={catColor}>
              {event.category}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mb={2}>
            {dateStr}
          </Text>
          <Text fw={700} size="lg" className="tabular-nums">
            {primary.value} {primary.unit} {primary.label.toLowerCase()}
          </Text>
          {event.description && (
            <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
              {event.description}
            </Text>
          )}
        </Paper>
      </div>
    </div>
  );
}

export function TimelineView({ events }: Props) {
  const now = dayjs();

  const { pastEvents, futureEvents, todayEvents } = useMemo(() => {
    const past: EventWithDuration[] = [];
    const future: EventWithDuration[] = [];
    const today: EventWithDuration[] = [];

    for (const event of events) {
      const date = event.nextOccurrence ?? event.eventDate;
      const d = dayjs(date);
      if (d.isSame(now, "day")) {
        today.push(event);
      } else if (d.isBefore(now)) {
        past.push(event);
      } else {
        future.push(event);
      }
    }

    past.sort(
      (a, b) =>
        new Date(b.nextOccurrence ?? b.eventDate).getTime() -
        new Date(a.nextOccurrence ?? a.eventDate).getTime(),
    );
    future.sort(
      (a, b) =>
        new Date(a.nextOccurrence ?? a.eventDate).getTime() -
        new Date(b.nextOccurrence ?? b.eventDate).getTime(),
    );

    return { pastEvents: past, futureEvents: future, todayEvents: today };
  }, [events, now]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <IconStar size={48} stroke={1.5} className="mb-4 opacity-40" />
        <p className="text-sm">No events to display on the timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--mantine-color-gray-4), transparent)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center pb-8">
        <Paper
          p="md"
          radius="lg"
          className="shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-6))",
            color: "white",
          }}
        >
          <Text fw={700} size="sm" ta="center">
            Today
          </Text>
          <Text size="xs" ta="center" opacity={0.8}>
            {now.format("MMM D, YYYY")}
          </Text>
          {todayEvents.length > 0 && (
            <Text size="sm" ta="center" fw={600} mt={4}>
              {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""}{" "}
              today
            </Text>
          )}
        </Paper>
      </div>

      <div className="space-y-6">
        {futureEvents.map((event) => (
          <TimelineEntry key={event.id} event={event} side="right" />
        ))}
      </div>

      {pastEvents.length > 0 && futureEvents.length > 0 && (
        <Box className="sidebar-section-divider my-6" />
      )}

      <div className="space-y-6 mt-6">
        {pastEvents.map((event) => (
          <TimelineEntry key={event.id} event={event} side="left" />
        ))}
      </div>
    </div>
  );
}
