"use client";

import { useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import {
  IconTarget,
  IconActivity,
  IconCheck,
  IconTemplate,
  IconReportAnalytics,
} from "@tabler/icons-react";

const OverviewTab = lazy(() => import("./OverviewTab"));
const ActiveTab = lazy(() => import("./ActiveTab"));
const CompletedTab = lazy(() => import("./CompletedTab"));
const TemplatesTab = lazy(() => import("./TemplatesTab"));
const AnalyticsTab = lazy(() => import("./AnalyticsTab"));

const tabs = [
  { value: "overview", label: "Overview", icon: IconTarget },
  { value: "active", label: "Active", icon: IconActivity },
  { value: "completed", label: "Completed", icon: IconCheck },
  { value: "templates", label: "Templates", icon: IconTemplate },
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

export function GoalsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/goals${qs ? `?${qs}` : ""}`);
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

      <Tabs.Panel value="overview">
        <Suspense fallback={<TabFallback />}>
          <OverviewTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="active">
        <Suspense fallback={<TabFallback />}>
          <ActiveTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="completed">
        <Suspense fallback={<TabFallback />}>
          <CompletedTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="templates">
        <Suspense fallback={<TabFallback />}>
          <TemplatesTab />
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
