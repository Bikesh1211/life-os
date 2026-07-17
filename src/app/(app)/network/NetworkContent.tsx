"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Skeleton } from "@mantine/core";
import {
  IconUsers, IconUserPlus, IconCake, IconCoffee, IconPlane,
  IconPhotoHeart, IconGift, IconCalendarEvent, IconTimelineEvent, IconReportAnalytics,
} from "@tabler/icons-react";

const ConnectionsContent = lazy(() => import("@/modules/network/components/ConnectionsContent").then(m => ({ default: m.ConnectionsContent })));
const MeetupsContent = lazy(() => import("@/modules/network/components/MeetupsContent").then(m => ({ default: m.MeetupsContent })));
const TripsContent = lazy(() => import("@/modules/network/components/TripsContent").then(m => ({ default: m.TripsContent })));
const MemoriesContent = lazy(() => import("@/modules/network/components/MemoriesContent").then(m => ({ default: m.MemoriesContent })));
const GiftsContent = lazy(() => import("@/modules/network/components/GiftsContent").then(m => ({ default: m.GiftsContent })));
const EventsContent = lazy(() => import("@/modules/network/components/EventsContent").then(m => ({ default: m.EventsContent })));
const NetworkOverviewPanel = lazy(() => import("./components/NetworkOverviewPanel").then(m => ({ default: m.NetworkOverviewPanel })));
const NetworkBirthdaysPanel = lazy(() => import("./components/NetworkBirthdaysPanel").then(m => ({ default: m.NetworkBirthdaysPanel })));
const NetworkTimelinePanel = lazy(() => import("./components/NetworkTimelinePanel").then(m => ({ default: m.NetworkTimelinePanel })));
const NetworkInsightsPanel = lazy(() => import("./components/NetworkInsightsPanel").then(m => ({ default: m.NetworkInsightsPanel })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "overview", label: "Overview", icon: IconUsers },
  { value: "connections", label: "Connections", icon: IconUserPlus },
  { value: "birthdays", label: "Birthdays", icon: IconCake },
  { value: "meetups", label: "Meetups", icon: IconCoffee },
  { value: "trips", label: "Trips", icon: IconPlane },
  { value: "memories", label: "Memories", icon: IconPhotoHeart },
  { value: "gifts", label: "Gifts", icon: IconGift },
  { value: "events", label: "Events", icon: IconCalendarEvent },
  { value: "timeline", label: "Timeline", icon: IconTimelineEvent },
  { value: "insights", label: "Insights", icon: IconReportAnalytics },
];

function TabFallback() {
  return (
    <Stack gap="md">
      <Skeleton height={40} width={300} />
      <Skeleton height={140} />
      <Skeleton height={320} />
    </Stack>
  );
}

export function NetworkContent({ defaultTab = "overview" }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "overview") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/network${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Suspense fallback={<TabFallback />}>
            <NetworkOverviewPanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="connections" pt="md">
          <Suspense fallback={<TabFallback />}>
            <ConnectionsContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="birthdays" pt="md">
          <Suspense fallback={<TabFallback />}>
            <NetworkBirthdaysPanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="meetups" pt="md">
          <Suspense fallback={<TabFallback />}>
            <MeetupsContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="trips" pt="md">
          <Suspense fallback={<TabFallback />}>
            <TripsContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="memories" pt="md">
          <Suspense fallback={<TabFallback />}>
            <MemoriesContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="gifts" pt="md">
          <Suspense fallback={<TabFallback />}>
            <GiftsContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="events" pt="md">
          <Suspense fallback={<TabFallback />}>
            <EventsContent />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <Suspense fallback={<TabFallback />}>
            <NetworkTimelinePanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          <Suspense fallback={<TabFallback />}>
            <NetworkInsightsPanel />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
