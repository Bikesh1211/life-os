"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Title, Group, Button, Tabs, Text } from "@mantine/core";
import {
  IconCards,
  IconTimelineEvent,
  IconCalendar,
  IconChartBar,
  IconPin,
  IconHistory,
  IconPlus,
} from "@tabler/icons-react";
import { StoryView } from "../timeline/components/StoryView";
import { EntryCard } from "./components/EntryCard";
import { QuickJournalInput } from "./components/QuickJournalInput";
import { JournalCardsPanel } from "./components/JournalCardsPanel";
import { CalendarView } from "./components/CalendarView";
import { InsightsPanel } from "./components/InsightsPanel";
import { TimelineContent as JournalTimelineView } from "./timeline/TimelineContent";
import type { JournalEntry } from "@/modules/journal";

type JournalStats = {
  totalEntries: number;
  moodDistribution: { mood: string | null; count: number }[];
  commonTags: { tag: string; count: number }[];
};

type Props = {
  entries: JournalEntry[];
  streak: number;
  stats: JournalStats;
  defaultTab?: string;
};

export function JournalContent({ entries, streak, stats, defaultTab = "browse" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "browse") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/journal${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleRefresh = useCallback(async () => {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setLocalEntries(data);
      }
    } catch {}
  }, []);

  const handleCreated = useCallback((entry: JournalEntry) => {
    setLocalEntries((prev) => [entry, ...prev]);
  }, []);

  const pinnedEntries = localEntries.filter((e) => e.isPinned);

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Journal</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => router.push("/journal/new")}
            variant="light"
            size="sm"
          >
            New Entry
          </Button>
        </Group>

        <QuickJournalInput onCreated={handleCreated} />

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="story" leftSection={<IconHistory size={16} />}>
              Story
            </Tabs.Tab>
            <Tabs.Tab value="browse" leftSection={<IconCards size={16} />}>
              Browse
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
            <StoryView onCreateClick={() => router.push("/journal/new")} />
          </Tabs.Panel>

          <Tabs.Panel value="browse" pt="md">
            <div className="h-[calc(100vh-280px)]">
              <JournalCardsPanel entries={localEntries} onRefresh={handleRefresh} />
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="timeline" pt="md">
            <JournalTimelineView entries={localEntries} hideHeader />
          </Tabs.Panel>

          <Tabs.Panel value="calendar" pt="md">
            <CalendarView entries={localEntries} />
          </Tabs.Panel>

          <Tabs.Panel value="pinned" pt="md">
            <Stack gap="sm">
              {pinnedEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <IconPin size={48} stroke={1.5} className="mb-4 opacity-40" />
                  <Text size="sm">No pinned entries. Pin an entry to see it here.</Text>
                </div>
              )}
              {pinnedEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="insights" pt="md">
            <InsightsPanel
              entries={localEntries}
              streak={streak}
              onCreateClick={() => router.push("/journal/new")}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
}
