"use client";

import { useEffect, useState } from "react";
import { Container, Title, Timeline as MantineTimeline, Text, ThemeIcon, Group, Stack, Skeleton } from "@mantine/core";
import { IconCoffee, IconCalendarEvent, IconPhotoHeart, IconUserPlus, IconCake } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

type TimelineEntry = {
  date: string;
  title: string;
  type: "meetup" | "event" | "memory" | "connection";
  icon: typeof IconCoffee;
  color: string;
};

export function NetworkTimelinePanel() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/network/meetups").then(r => r.ok ? r.json() : []),
      fetch("/api/network/events").then(r => r.ok ? r.json() : []),
      fetch("/api/network/memories").then(r => r.ok ? r.json() : []),
      fetch("/api/network/connections").then(r => r.ok ? r.json() : []),
    ]).then(([meetups, events, memories, connections]) => {
      const result: TimelineEntry[] = [];
      for (const m of meetups) {
        result.push({ date: m.date, title: m.title, type: "meetup", icon: IconCoffee, color: "orange" });
      }
      for (const e of events) {
        result.push({ date: e.date, title: `${e.eventType}: ${e.title}`, type: "event", icon: IconCalendarEvent, color: "teal" });
      }
      for (const m of memories) {
        result.push({ date: m.memoryDate ?? "", title: m.title, type: "memory", icon: IconPhotoHeart, color: "violet" });
      }
      for (const c of connections) {
        if (c.firstMetDate) {
          result.push({ date: c.firstMetDate, title: `Met ${c.name}`, type: "connection", icon: IconUserPlus, color: "blue" });
        }
      }
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Stack>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={50} radius="md" />)}</Stack>;
  }

  if (entries.length === 0) {
    return <FeaturePlaceholder title="Timeline" description="Your social timeline will appear here" icon={IconCake} />;
  }

  return (
    <>
      <Title order={2} mb="lg">Friendship Timeline</Title>
      <MantineTimeline active={entries.length - 1} bulletSize={32} lineWidth={2}>
        {entries.map((entry, i) => (
          <MantineTimeline.Item key={`${entry.type}-${i}`}
            bullet={<entry.icon size={16} />} color={entry.color}>
            <Text size="sm" c="dimmed">{entry.date}</Text>
            <Text fw={500}>{entry.title}</Text>
          </MantineTimeline.Item>
        ))}
      </MantineTimeline>
    </>
  );
}
