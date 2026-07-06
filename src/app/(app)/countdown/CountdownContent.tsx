"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs, SimpleGrid, Title, Group, Button, Text } from "@mantine/core";
import {
  IconDashboard,
  IconHeart,
  IconCircleCheck,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { NearestEvent } from "./components/NearestEvent";
import { CountdownCard } from "./components/CountdownCard";
import { QuickAddModal } from "./components/QuickAddModal";
import type { EnrichedCountdownEvent } from "@/modules/countdown";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconDashboard },
  { value: "favorites", label: "Favorites", icon: IconHeart },
  { value: "completed", label: "Completed", icon: IconCircleCheck },
  { value: "archived", label: "Archived", icon: IconArchive },
];

export function CountdownContent({ defaultTab = "dashboard" }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>(sp.get("tab") ?? defaultTab);
  const [events, setEvents] = useState<EnrichedCountdownEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === "completed" ? "completed"
        : activeTab === "archived" ? "archived"
        : undefined;
      const res = await fetch(`/api/countdown?status=${status ?? ""}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {}
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleTabChange = useCallback((value: string | null) => {
    setActiveTab(value);
    const params = new URLSearchParams(sp.toString());
    if (value && value !== "dashboard") { params.set("tab", value); }
    else { params.delete("tab"); }
    const qs = params.toString();
    router.replace(`/countdown${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, sp]);

  const nearest = events.length > 0
    ? events.filter((e: EnrichedCountdownEvent) => e.status === "pending" && e.progress && !e.progress.isPast)
        .sort((a: EnrichedCountdownEvent, b: EnrichedCountdownEvent) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )[0]
    : null;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Countdown</Title>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={openAdd}
          variant="light"
          size="sm"
        >
          New Event
        </Button>
      </Group>

      <QuickAddModal opened={addOpened} onClose={closeAdd} />

      {activeTab === "dashboard" && nearest && (
        <NearestEvent event={nearest} />
      )}

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} pt="md">
            {loading ? (
              <Text c="dimmed" size="sm">Loading...</Text>
            ) : events.length === 0 ? (
              <Text c="dimmed" size="sm" ta="center" py="xl">
                No events yet. Create your first countdown!
              </Text>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {events.map((event: EnrichedCountdownEvent) => (
                  <CountdownCard key={event.id} event={event} />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  );
}
