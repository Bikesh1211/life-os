"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconCheck, IconX, IconClock, IconUpload, IconPlayerPlay, IconTrash } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Timeline } from "@mantine/core";
import dayjs from "dayjs";

type TimelineEvent = {
  id: string;
  commitmentId: string;
  eventType: string;
  metadata: Record<string, any> | null;
  timestamp: string;
  commitment: {
    id: string;
    title: string;
    difficulty: string;
    status: string;
  } | null;
};

const eventIcons: Record<string, typeof IconCheck> = {
  completed: IconCheck,
  evidence_uploaded: IconUpload,
  started: IconPlayerPlay,
  created: IconClock,
  failed: IconX,
  missed: IconX,
  cancelled: IconTrash,
  progress_updated: IconClock,
  reminder_sent: IconClock,
};

const eventColors: Record<string, string> = {
  completed: "green",
  evidence_uploaded: "teal",
  started: "blue",
  created: "gray",
  failed: "red",
  missed: "red",
  cancelled: "gray",
  progress_updated: "yellow",
  reminder_sent: "yellow",
};

export default function TimelineTab() {
  const { data: events, isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["integrity", "events"],
    queryFn: () =>
      fetch("/api/integrity/events").then((r) => (r.ok ? r.json() : [])),
    staleTime: 30 * 1000,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Accountability Timeline
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          Every action on your commitments is logged here
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconClock size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Activity Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Your commitment activity will appear here.
          </p>
        </div>
      ) : (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Timeline active={events.length - 1} bulletSize={28} lineWidth={2}>
            {events.map((event) => {
              const IconComponent = eventIcons[event.eventType] ?? IconClock;
              return (
                <Timeline.Item
                  key={event.id}
                  title={event.eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  color={eventColors[event.eventType] ?? "gray"}
                  bullet={<IconComponent size={14} />}
                >
                  <Text size="sm">
                    {event.commitment?.title ?? "Unknown commitment"}
                  </Text>
                  {event.metadata && event.metadata.from && (
                    <Text size="xs" c="dimmed">
                      Status: {event.metadata.from} → {event.metadata.to}
                    </Text>
                  )}
                  <Group gap="xs" mt={4}>
                    {event.commitment && (
                      <Badge
                        size="xs"
                        color={event.commitment.difficulty === "easy" ? "green" : event.commitment.difficulty === "hard" ? "orange" : event.commitment.difficulty === "extreme" ? "red" : "yellow"}
                        variant="light"
                      >
                        {event.commitment.difficulty}
                      </Badge>
                    )}
                    <Text size="xs" c="dimmed">
                      {dayjs(event.timestamp).format("MMM D, YYYY h:mm A")}
                    </Text>
                  </Group>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Card>
      )}
    </div>
  );
}
