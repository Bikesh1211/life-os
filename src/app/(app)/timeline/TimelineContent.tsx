"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Stack,
  Title,
  Group,
  Button,
  Tabs,
  Text,
  rem,
} from "@mantine/core";
import {
  IconSun,
  IconCards,
  IconTimelineEvent,
  IconCalendar,
  IconChartBar,
  IconPin,
  IconHistory,
} from "@tabler/icons-react";
import { QuickAdd } from "./components/QuickAdd";
import { TodayView } from "./components/TodayView";
import { EventCard } from "./components/EventCard";
import { TimelineView } from "./components/TimelineView";
import { CalendarView } from "./components/CalendarView";
import { InsightsPanel } from "./components/InsightsPanel";
import { StoryView } from "./components/StoryView";
import { EventCreateModal } from "./components/EventCreateModal";
import { EventEditModal } from "./components/EventEditModal";
import type { TimelineEvent } from "@/modules/timeline/repository";
import type { DurationBreakdown } from "@/modules/timeline";

type EventWithDuration = TimelineEvent & {
  duration: DurationBreakdown;
  nextOccurrence: Date | null;
};

type Props = {
  events: EventWithDuration[];
  defaultTab?: string;
};

export function TimelineContent({ events, defaultTab = "story" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );
  const [createOpened, setCreateOpened] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDuration | null>(null);
  const [localEvents, setLocalEvents] = useState<EventWithDuration[]>(events);

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "today") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/timeline${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleRefresh = useCallback(async () => {
    try {
      const res = await fetch("/api/timeline");
      if (res.ok) {
        const data = await res.json();
        setLocalEvents(data);
      }
    } catch {}
  }, []);

  const handleCreated = useCallback((event: unknown) => {
    setLocalEvents((prev) => [event as EventWithDuration, ...prev]);
  }, []);

  const handleUpdated = useCallback((updated: unknown) => {
    setLocalEvents((prev) =>
      prev.map((e) =>
        (updated as EventWithDuration).id === e.id
          ? (updated as EventWithDuration)
          : e,
      ),
    );
    setEditingEvent(null);
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    setEditingEvent(null);
  }, []);

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Life Timeline</Title>
          <Button
            leftSection={<IconTimelineEvent size={18} />}
            onClick={() => setCreateOpened(true)}
            variant="light"
            size="sm"
          >
            New Event
          </Button>
        </Group>

        <QuickAdd onCreated={handleRefresh} />

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="story" leftSection={<IconHistory size={16} />}>
              Story
            </Tabs.Tab>
            <Tabs.Tab value="today" leftSection={<IconSun size={16} />}>
              Today
            </Tabs.Tab>
            <Tabs.Tab value="cards" leftSection={<IconCards size={16} />}>
              Cards
            </Tabs.Tab>
            <Tabs.Tab value="timeline" leftSection={<IconTimelineEvent size={16} />}>
              Timeline
            </Tabs.Tab>
            <Tabs.Tab value="calendar" leftSection={<IconCalendar size={16} />}>
              Calendar
            </Tabs.Tab>
            <Tabs.Tab value="pinned" leftSection={<IconPin size={16} />}>
              Pinned
            </Tabs.Tab>
            <Tabs.Tab value="insights" leftSection={<IconChartBar size={16} />}>
              Insights
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="story" pt="md">
            <StoryView onCreateClick={() => setCreateOpened(true)} />
          </Tabs.Panel>

          <Tabs.Panel value="today" pt="md">
            <TodayView
              events={localEvents}
              onEdit={(event) => setEditingEvent(event as EventWithDuration)}
              onDeleted={handleDeleted}
              onRefresh={handleRefresh}
            />
          </Tabs.Panel>

          <Tabs.Panel value="cards" pt="md">
            <Stack gap="sm">
              {localEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <IconTimelineEvent size={48} stroke={1.5} className="mb-4 opacity-40" />
                  <Text size="sm">No events yet. Create your first one!</Text>
                </div>
              )}
              {localEvents
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  const aDate = a.nextOccurrence ?? a.eventDate;
                  const bDate = b.nextOccurrence ?? b.eventDate;
                  return new Date(bDate).getTime() - new Date(aDate).getTime();
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDeleted={handleDeleted}
                  />
                ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="timeline" pt="md">
            <TimelineView
              events={localEvents}
              onEdit={(e) => setEditingEvent(e)}
              onDeleted={handleDeleted}
            />
          </Tabs.Panel>

          <Tabs.Panel value="calendar" pt="md">
            <CalendarView events={localEvents} />
          </Tabs.Panel>

          <Tabs.Panel value="pinned" pt="md">
            <Stack gap="sm">
              {localEvents.filter((e) => e.isPinned).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <IconPin size={48} stroke={1.5} className="mb-4 opacity-40" />
                  <Text size="sm">No pinned events. Pin an event to see it here.</Text>
                </div>
              )}
              {localEvents
                .filter((e) => e.isPinned)
                .sort((a, b) => {
                  const aDate = a.nextOccurrence ?? a.eventDate;
                  const bDate = b.nextOccurrence ?? b.eventDate;
                  return new Date(bDate).getTime() - new Date(aDate).getTime();
                })
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDeleted={handleDeleted}
                  />
                ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="insights" pt="md">
            <InsightsPanel
              events={localEvents}
              onCreateClick={() => setCreateOpened(true)}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <EventCreateModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        onCreated={handleCreated}
      />

      {editingEvent && (
        <EventEditModal
          opened={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
