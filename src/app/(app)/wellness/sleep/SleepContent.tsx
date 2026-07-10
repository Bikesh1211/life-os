"use client";

import { Suspense } from "react";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconCalendarTime,
  IconGraph,
  IconBulb,
} from "@tabler/icons-react";

import { DashboardTab } from "./components/DashboardTab";
import { HistoryTab } from "./components/HistoryTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { InsightsTab } from "./components/InsightsTab";

function TabFallback() {
  return (
    <Stack>
      <Skeleton height={200} radius="md" />
      <Skeleton height={120} radius="md" />
      <Skeleton height={120} radius="md" />
    </Stack>
  );
}

export function SleepContent() {
  return (
    <Tabs defaultValue="dashboard" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="dashboard" leftSection={<IconLayoutDashboard size={16} />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="history" leftSection={<IconCalendarTime size={16} />}>
          History
        </Tabs.Tab>
        <Tabs.Tab value="analytics" leftSection={<IconGraph size={16} />}>
          Analytics
        </Tabs.Tab>
        <Tabs.Tab value="insights" leftSection={<IconBulb size={16} />}>
          Insights
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="md">
        <Suspense fallback={<TabFallback />}>
          <DashboardTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="history" pt="md">
        <Suspense fallback={<TabFallback />}>
          <HistoryTab />
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
  );
}
