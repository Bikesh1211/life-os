"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Skeleton } from "@mantine/core";
import { IconRepeat, IconCopy, IconCalendarTime, IconReportAnalytics } from "@tabler/icons-react";

const RoutinesDashboardPanel = lazy(() => import("./components/RoutinesDashboardPanel").then(m => ({ default: m.RoutinesDashboardPanel })));
const RoutinesTemplatesPanel = lazy(() => import("./components/RoutinesTemplatesPanel").then(m => ({ default: m.RoutinesTemplatesPanel })));
const RoutinesTimelinePanel = lazy(() => import("./components/RoutinesTimelinePanel").then(m => ({ default: m.RoutinesTimelinePanel })));
const RoutinesAnalyticsPanel = lazy(() => import("./components/RoutinesAnalyticsPanel").then(m => ({ default: m.RoutinesAnalyticsPanel })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconRepeat },
  { value: "templates", label: "Templates", icon: IconCopy },
  { value: "timeline", label: "Timeline", icon: IconCalendarTime },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
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

export function RoutinesContent({ defaultTab = "dashboard" }: Props) {
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
      window.history.replaceState(null, "", `/routines${qs ? `?${qs}` : ""}`);
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

        <Tabs.Panel value="dashboard" pt="md">
          <Suspense fallback={<TabFallback />}>
            <RoutinesDashboardPanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="templates" pt="md">
          <Suspense fallback={<TabFallback />}>
            <RoutinesTemplatesPanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <Suspense fallback={<TabFallback />}>
            <RoutinesTimelinePanel />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <Suspense fallback={<TabFallback />}>
            <RoutinesAnalyticsPanel />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
