"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import { IconRepeat, IconCopy, IconCalendarTime, IconReportAnalytics } from "@tabler/icons-react";
import { RoutinesDashboardPanel } from "./components/RoutinesDashboardPanel";
import { RoutinesTemplatesPanel } from "./components/RoutinesTemplatesPanel";
import { RoutinesTimelinePanel } from "./components/RoutinesTimelinePanel";
import { RoutinesAnalyticsPanel } from "./components/RoutinesAnalyticsPanel";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconRepeat },
  { value: "templates", label: "Templates", icon: IconCopy },
  { value: "timeline", label: "Timeline", icon: IconCalendarTime },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function RoutinesContent({ defaultTab = "dashboard" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "dashboard") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/routines${qs ? `?${qs}` : ""}`, { scroll: false });
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

        <Tabs.Panel value="dashboard" pt="md">
          <RoutinesDashboardPanel />
        </Tabs.Panel>

        <Tabs.Panel value="templates" pt="md">
          <RoutinesTemplatesPanel />
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <RoutinesTimelinePanel />
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <RoutinesAnalyticsPanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
