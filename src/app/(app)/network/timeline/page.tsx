import { getCurrentUserId } from "@/core/auth";
import { getMeetups, getEvents, getMemories, getConnections } from "@/modules/network";
import { Container, Title, Timeline as MantineTimeline, Text, ThemeIcon, Group } from "@mantine/core";
import { IconCoffee, IconCalendarEvent, IconPhotoHeart, IconUserPlus, IconCake } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

type TimelineEntry = {
  date: string;
  title: string;
  type: "meetup" | "event" | "memory" | "connection";
  icon: typeof IconCoffee;
  color: string;
};

export default async function TimelinePage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [meetups, events, memories, connections] = await Promise.all([
    getMeetups(userId),
    getEvents(userId),
    getMemories(userId),
    getConnections(userId),
  ]);

  const entries: TimelineEntry[] = [];

  for (const m of meetups) {
    entries.push({ date: m.date, title: m.title, type: "meetup", icon: IconCoffee, color: "orange" });
  }
  for (const e of events) {
    entries.push({ date: e.date, title: `${e.eventType}: ${e.title}`, type: "event", icon: IconCalendarEvent, color: "teal" });
  }
  for (const m of memories) {
    entries.push({ date: m.memoryDate ?? "", title: m.title, type: "memory", icon: IconPhotoHeart, color: "violet" });
  }
  for (const c of connections) {
    if (c.firstMetDate) {
      entries.push({ date: c.firstMetDate, title: `Met ${c.name}`, type: "connection", icon: IconUserPlus, color: "blue" });
    }
  }

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) {
    return (
      <Container size="xl">
        <FeaturePlaceholder title="Timeline" description="Your social timeline will appear here" icon={IconCake} />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Friendship Timeline</Title>
      <MantineTimeline active={entries.length - 1} bulletSize={32} lineWidth={2}>
        {entries.map((entry, i) => (
          <MantineTimeline.Item
            key={`${entry.type}-${i}`}
            bullet={<entry.icon size={16} />}
            color={entry.color}
          >
            <Text size="sm" c="dimmed">{entry.date}</Text>
            <Text fw={500}>{entry.title}</Text>
          </MantineTimeline.Item>
        ))}
      </MantineTimeline>
    </Container>
  );
}
