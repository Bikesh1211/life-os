"use client";

import { useState, useMemo } from "react";
import {
  Paper,
  Stack,
  Text,
  Group,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  SimpleGrid,
} from "@mantine/core";
import {
  IconMapPin,
  IconChevronDown,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import type { TimelineEvent } from "@/modules/timeline/repository";
import dayjs from "dayjs";

type Props = {
  events: TimelineEvent[];
  onEdit: (event: TimelineEvent) => void;
  onDeleted: (id: string) => void;
  onRefresh: () => void;
};

const CATEGORY_COLORS: Record<string, string> = {
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

const MOOD_EMOJIS: Record<number, string> = {
  1: "😫", 2: "😟", 3: "😐", 4: "😊", 5: "🤩",
};

const ENERGY_EMOJIS: Record<number, string> = {
  1: "🪫", 2: "🔋", 3: "⚡", 4: "🔥", 5: "💫",
};

function ActivityCard({
  event,
  onEdit,
  onDeleted,
}: {
  event: TimelineEvent;
  onEdit: () => void;
  onDeleted: (id: string) => void;
}) {
  const [details, setDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const catColor = CATEGORY_COLORS[event.category] ?? "gray";
  const time = event.startTime ?? dayjs(event.eventDate).format("HH:mm");
  const hasEnd = !!event.endTime;

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/timeline/${event.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(event.id);
    } finally {
      setDeleting(false);
    }
  };

  const durationText = event.durationMinutes
    ? event.durationMinutes >= 60
      ? `${Math.floor(event.durationMinutes / 60)}h ${event.durationMinutes % 60}m`
      : `${event.durationMinutes}m`
    : null;

  return (
    <Paper
      p="sm"
      radius="md"
      className="transition-all hover:shadow-sm"
      style={{ borderLeft: `3px solid var(--mantine-color-${catColor}-5)` }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <Box style={{ minWidth: 40 }} className="text-center">
          <Text size="xs" fw={600} className="tabular-nums" c="dimmed">
            {time}
          </Text>
          {hasEnd && (
            <Text size="xs" c="gray" className="tabular-nums">
              {event.endTime}
            </Text>
          )}
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm">
            {event.title}
          </Text>
          <Group gap={4} mt={2}>
            <Badge size="xs" color={catColor} variant="light">
              {event.category}
            </Badge>
            {event.activityType && (
              <Badge size="xs" variant="outline" color="gray">
                {event.activityType}
              </Badge>
            )}
            {durationText && (
              <Badge size="xs" variant="filled" color="gray">
                {durationText}
              </Badge>
            )}
          </Group>
          {event.description && (
            <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
              {event.description}
            </Text>
          )}
          {event.location && (
            <Group gap={4} mt={2}>
              <IconMapPin size={10} className="text-gray-400" />
              <Text size="xs" c="dimmed">{event.location}</Text>
            </Group>
          )}

          {(event.mood || event.energy) && (
            <Group gap={4} mt={2}>
              {event.mood && (
                <Text size="xs">{MOOD_EMOJIS[event.mood] ?? event.mood}</Text>
              )}
              {event.energy && (
                <Text size="xs">{ENERGY_EMOJIS[event.energy] ?? event.energy}</Text>
              )}
            </Group>
          )}
        </Box>

        <Stack gap={4} align="center">
          <Tooltip label={details ? "Less" : "More"}>
            <ActionIcon variant="subtle" size="sm" onClick={() => setDetails(!details)}>
              <IconChevronDown
                size={14}
                className={`transition-transform ${details ? "rotate-180" : ""}`}
              />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="sm" onClick={onEdit}>
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red" onClick={handleDelete} loading={deleting}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Group>
    </Paper>
  );
}

function DailySummary({ events }: { events: TimelineEvent[] }) {
  const stats = useMemo(() => {
    const total = events.length;
    let trackedMinutes = 0;
    const categoryCount: Record<string, number> = {};
    for (const e of events) {
      if (e.durationMinutes) trackedMinutes += e.durationMinutes;
      categoryCount[e.category] = (categoryCount[e.category] ?? 0) + 1;
    }
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    return { total, trackedMinutes, topCategories };
  }, [events]);

  if (events.length === 0) return null;

  return (
    <Paper p="sm" radius="md" bg="gray.0" className="dark:bg-gray-800">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <Box className="text-center">
          <Text fw={700} size="xl" className="tabular-nums">
            {stats.total}
          </Text>
          <Text size="xs" c="dimmed">Activities</Text>
        </Box>
        <Box className="text-center">
          <Text fw={700} size="xl" className="tabular-nums">
            {stats.trackedMinutes >= 60
              ? `${Math.round(stats.trackedMinutes / 60)}h`
              : `${stats.trackedMinutes}m`}
          </Text>
          <Text size="xs" c="dimmed">Tracked</Text>
        </Box>
        {stats.topCategories.map(([cat, count]) => (
          <Box key={cat} className="text-center">
            <Text fw={700} size="xl" className="tabular-nums" tt="capitalize">
              {count}
            </Text>
            <Text size="xs" c="dimmed" tt="capitalize">{cat}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Paper>
  );
}

export function TodayView({ events, onEdit, onDeleted, onRefresh }: Props) {
  const todayStr = dayjs().format("YYYY-MM-DD");
  const todayEvents = useMemo(
    () =>
      events
        .filter((e) => dayjs(e.eventDate).format("YYYY-MM-DD") === todayStr)
        .sort((a, b) => {
          const aTime = a.startTime ?? dayjs(a.eventDate).format("HH:mm");
          const bTime = b.startTime ?? dayjs(b.eventDate).format("HH:mm");
          return aTime.localeCompare(bTime);
        }),
    [events, todayStr],
  );

  return (
    <Stack gap="md">
      <DailySummary events={todayEvents} />

      {todayEvents.length === 0 ? (
        <Paper p="xl" radius="md" className="text-center">
          <Text c="dimmed" size="sm">
            No activities logged today. Start tracking above!
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {todayEvents.map((event) => (
            <ActivityCard
              key={event.id}
              event={event}
              onEdit={() => onEdit(event)}
              onDeleted={onDeleted}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
