"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Group,
  Text,
  ThemeIcon,
  Badge,
  ActionIcon,
  Tooltip,
  Stack,
  Collapse,
  Box,
  rem,
} from "@mantine/core";
import {
  IconPin,
  IconPinFilled,
  IconEdit,
  IconTrash,
  IconChevronDown,
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
import { computeDuration, getPrimaryUnit } from "@/modules/timeline/utils";
import type { TimelineEvent } from "@/modules/timeline/repository";
import type { DurationBreakdown } from "@/modules/timeline";
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

const importanceConfig: Record<string, { color: string }> = {
  critical: { color: "red" },
  high: { color: "orange" },
  medium: { color: "yellow" },
  low: { color: "gray" },
};

type EventWithDuration = TimelineEvent & {
  duration: DurationBreakdown;
  nextOccurrence: Date | null;
};

type Props = {
  event: EventWithDuration;
  onEdit: () => void;
  onDeleted: (id: string) => void;
};

function useLiveDuration(eventDate: Date, recurrence: string) {
  const [duration, setDuration] = useState(() => computeDuration(eventDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const effectiveDate =
        recurrence !== "none"
          ? computeNextOccurrenceSimple(eventDate, recurrence)
          : eventDate;
      setDuration(computeDuration(effectiveDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [eventDate, recurrence]);

  return duration;
}

function computeNextOccurrenceSimple(date: Date, recurrence: string): Date {
  if (recurrence === "none") return date;
  const now = dayjs();
  let current = dayjs(date);
  let iterations = 0;
  while (current.isBefore(now) && iterations < 1000) {
    current = current.add(1, recurrence as dayjs.ManipulateType);
    iterations++;
  }
  return current.toDate();
}

function DetailedBreakdown({
  duration,
}: {
  duration: DurationBreakdown;
}) {
  const items = [
    { value: duration.years, label: "Years" },
    { value: duration.months, label: "Months" },
    { value: duration.weeks, label: "Weeks" },
    { value: duration.days, label: "Days" },
    { value: duration.hours, label: "Hours" },
    { value: duration.minutes, label: "Min" },
  ];

  return (
    <Group gap="xs" wrap="wrap">
      {items.map(
        (item) =>
          item.value > 0 && (
            <Box key={item.label} className="text-center">
              <Text fw={700} size="xl" className="tabular-nums leading-tight">
                {item.value}
              </Text>
              <Text size="xs" c="dimmed">
                {item.label}
              </Text>
            </Box>
          ),
      )}
      <Box className="ml-auto self-center">
        <Text size="sm" fw={500} c="dimmed">
          {duration.isPast ? "Since" : "Remaining"}
        </Text>
      </Box>
    </Group>
  );
}

export function EventCard({ event, onEdit, onDeleted }: Props) {
  const [detailed, setDetailed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const duration = useLiveDuration(
    event.nextOccurrence ?? event.eventDate,
    event.recurrence,
  );
  const primary = getPrimaryUnit(duration);
  const CategoryIcon = categoryIcons[event.category] ?? IconStar;
  const catColor = categoryColors[event.category] ?? "gray";
  const impColor = importanceConfig[event.importance]?.color ?? "gray";
  const accentColor = event.color ?? `var(--mantine-color-${catColor}-6)`;

  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this event?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/timeline/${event.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(event.id);
      }
    } catch {
      setDeleting(false);
    }
  }, [event.id, onDeleted]);

  return (
    <Paper
      p="md"
      radius="md"
      className="relative overflow-hidden transition-all duration-150 hover:shadow-sm"
      style={{
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon
          variant="light"
          size="lg"
          color={catColor}
          radius="md"
          style={{ transition: "all 0.15s ease" }}
        >
          <CategoryIcon size={20} />
        </ThemeIcon>

        <div className="flex-1 min-w-0">
          <Group gap="xs" mb={2}>
            <Text fw={600} size="sm" truncate>
              {event.title}
            </Text>
            {event.isPinned && (
              <IconPinFilled size={12} className="text-blue-500" />
            )}
            <Badge
              size="xs"
              variant="light"
              color={impColor}
              className="uppercase tracking-wider"
            >
              {event.importance}
            </Badge>
            {event.recurrence !== "none" && (
              <Badge size="xs" variant="outline" color="gray">
                {event.recurrence}
              </Badge>
            )}
          </Group>

          {event.description && (
            <Text size="xs" c="dimmed" lineClamp={1} mb="xs">
              {event.description}
            </Text>
          )}

          {!detailed ? (
            <Group gap={6} align="baseline">
              <Text
                fw={700}
                size="28px"
                className="tabular-nums"
                style={{ color: accentColor, lineHeight: 1.1 }}
              >
                {primary.value}
              </Text>
              <Text size="sm" c="dimmed" fw={500}>
                {primary.unit}
              </Text>
              <Text size="xs" c="dimmed">
                {primary.label}
              </Text>
            </Group>
          ) : (
            <DetailedBreakdown duration={duration} />
          )}
        </div>

        <Stack gap={4} align="center">
          <Tooltip label={detailed ? "Show compact" : "Show details"}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setDetailed(!detailed)}
            >
              <IconChevronDown
                size={14}
                className={`transition-transform duration-150 ${
                  detailed ? "rotate-180" : ""
                }`}
              />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="sm" onClick={onEdit}>
              <IconEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="red"
              onClick={handleDelete}
              loading={deleting}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </Group>

      {event.recurrence !== "none" && event.nextOccurrence && (
        <Text size="xs" c="dimmed" mt={4}>
          Next occurrence: {dayjs(event.nextOccurrence).format("MMM D, YYYY")}
        </Text>
      )}
    </Paper>
  );
}
