"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  Title,
  Group,
  Button,
  Tabs,
  rem,
} from "@mantine/core";
import {
  IconCards,
  IconTimelineEvent,
  IconCalendar,
  IconChartBar,
  IconPlus,
} from "@tabler/icons-react";
import { EventCard } from "./components/EventCard";
import { EventCreateModal } from "./components/EventCreateModal";
import { EventEditModal } from "./components/EventEditModal";
import { TimelineView } from "./components/TimelineView";
import { CalendarView } from "./components/CalendarView";
import { InsightsPanel } from "./components/InsightsPanel";
import type { TimelineEvent } from "@/modules/timeline/repository";
import type { DurationBreakdown } from "@/modules/timeline";

type EventWithDuration = TimelineEvent & {
  duration: DurationBreakdown;
  nextOccurrence: Date | null;
};

type Props = {
  events: EventWithDuration[];
};

export function TimelineContent({ events }: Props) {
  const [activeTab, setActiveTab] = useState<string | null>("cards");
  const [createOpened, setCreateOpened] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDuration | null>(null);
  const [localEvents, setLocalEvents] = useState<EventWithDuration[]>(events);

  const handleCreated = useCallback((event: unknown) => {
    setLocalEvents((prev) => [event as EventWithDuration, ...prev]);
    setCreateOpened(false);
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
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Life Timeline</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setCreateOpened(true)}
          >
            New Event
          </Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="cards" leftSection={<IconCards size={16} />}>
              Cards
            </Tabs.Tab>
            <Tabs.Tab
              value="timeline"
              leftSection={<IconTimelineEvent size={16} />}
            >
              Timeline
            </Tabs.Tab>
            <Tabs.Tab value="calendar" leftSection={<IconCalendar size={16} />}>
              Calendar
            </Tabs.Tab>
            <Tabs.Tab value="insights" leftSection={<IconChartBar size={16} />}>
              Insights
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="cards" pt="md">
            <Stack gap="sm">
              {localEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <IconTimelineEvent
                    size={48}
                    stroke={1.5}
                    className="mb-4 opacity-40"
                  />
                  <p className="text-sm">No events yet. Create your first one!</p>
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
