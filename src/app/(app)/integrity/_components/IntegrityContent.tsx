"use client";

import { useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import {
  IconDashboard,
  IconScale,
  IconTimelineEvent,
  IconReportAnalytics,
} from "@tabler/icons-react";

const DashboardTab = lazy(() => import("./DashboardTab"));
const ReviewTab = lazy(() => import("./ReviewTab"));
const TimelineTab = lazy(() => import("./TimelineTab"));
const AnalyticsTab = lazy(() => import("./AnalyticsTab"));

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconDashboard },
  { value: "review", label: "Review", icon: IconScale },
  { value: "timeline", label: "Timeline", icon: IconTimelineEvent },
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

export function IntegrityContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "dashboard";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "dashboard") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/integrity${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List mb="lg">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={<tab.icon size={18} />}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="dashboard">
        <Suspense fallback={<TabFallback />}>
          <DashboardTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="review">
        <Suspense fallback={<TabFallback />}>
          <ReviewTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="timeline">
        <Suspense fallback={<TabFallback />}>
          <TimelineTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="analytics">
        <Suspense fallback={<TabFallback />}>
          <AnalyticsTab />
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}
