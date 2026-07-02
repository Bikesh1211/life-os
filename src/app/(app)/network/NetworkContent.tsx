"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconUsers, IconUserPlus, IconCake, IconCoffee, IconPlane,
  IconPhotoHeart, IconGift, IconCalendarEvent, IconTimelineEvent, IconReportAnalytics,
} from "@tabler/icons-react";
import { ConnectionsContent } from "@/modules/network/components/ConnectionsContent";
import { MeetupsContent } from "@/modules/network/components/MeetupsContent";
import { TripsContent } from "@/modules/network/components/TripsContent";
import { MemoriesContent } from "@/modules/network/components/MemoriesContent";
import { GiftsContent } from "@/modules/network/components/GiftsContent";
import { EventsContent } from "@/modules/network/components/EventsContent";
import { NetworkOverviewPanel } from "./components/NetworkOverviewPanel";
import { NetworkBirthdaysPanel } from "./components/NetworkBirthdaysPanel";
import { NetworkTimelinePanel } from "./components/NetworkTimelinePanel";
import { NetworkInsightsPanel } from "./components/NetworkInsightsPanel";

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

export function NetworkContent({ defaultTab = "overview" }: Props) {
  const router = useRouter();
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
      router.replace(`/network${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
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
          <NetworkOverviewPanel />
        </Tabs.Panel>

        <Tabs.Panel value="connections" pt="md">
          <ConnectionsContent />
        </Tabs.Panel>

        <Tabs.Panel value="birthdays" pt="md">
          <NetworkBirthdaysPanel />
        </Tabs.Panel>

        <Tabs.Panel value="meetups" pt="md">
          <MeetupsContent />
        </Tabs.Panel>

        <Tabs.Panel value="trips" pt="md">
          <TripsContent />
        </Tabs.Panel>

        <Tabs.Panel value="memories" pt="md">
          <MemoriesContent />
        </Tabs.Panel>

        <Tabs.Panel value="gifts" pt="md">
          <GiftsContent />
        </Tabs.Panel>

        <Tabs.Panel value="events" pt="md">
          <EventsContent />
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <NetworkTimelinePanel />
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          <NetworkInsightsPanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
