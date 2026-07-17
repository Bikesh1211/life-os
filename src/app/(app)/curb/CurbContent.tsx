"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Skeleton } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconList,
  IconCalendar,
  IconTimelineEvent,
  IconReportAnalytics,
  IconBulb,
} from "@tabler/icons-react";

const DashboardTab = lazy(() => import("./components/DashboardTab").then(m => ({ default: m.DashboardTab })));
const HabitsTab = lazy(() => import("./components/HabitsTab").then(m => ({ default: m.HabitsTab })));
const CalendarTab = lazy(() => import("./components/CalendarTab").then(m => ({ default: m.CalendarTab })));
const TimelineTab = lazy(() => import("./components/TimelineTab").then(m => ({ default: m.TimelineTab })));
const AnalyticsTab = lazy(() => import("./components/AnalyticsTab").then(m => ({ default: m.AnalyticsTab })));
const InsightsTab = lazy(() => import("./components/InsightsTab").then(m => ({ default: m.InsightsTab })));

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "habits", label: "Habits", icon: IconList },
  { value: "calendar", label: "Calendar", icon: IconCalendar },
  { value: "timeline", label: "Timeline", icon: IconTimelineEvent },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
  { value: "insights", label: "Insights", icon: IconBulb },
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

export function CurbContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? "dashboard",
  );
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!seeded) {
      fetch("/api/curb/seed", { method: "POST" }).catch(() => {});
      setSeeded(true);
    }
  }, [seeded]);

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
      window.history.replaceState(null, "", `/curb${qs ? `?${qs}` : ""}`);
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
            <DashboardTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="habits" pt="md">
          <Suspense fallback={<TabFallback />}>
            <HabitsTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="calendar" pt="md">
          <Suspense fallback={<TabFallback />}>
            <CalendarTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <Suspense fallback={<TabFallback />}>
            <TimelineTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <Suspense fallback={<TabFallback />}>
            <AnalyticsTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          <Suspense fallback={<TabFallback />}>
            <InsightsTab />
          </Suspense>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
