"use client";

import { Suspense } from "react";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconList,
  IconTimelineEvent,
  IconCalendar,
  IconGraph,
} from "@tabler/icons-react";

import { DashboardTab } from "./components/DashboardTab";
import { ActivitiesTab } from "./components/ActivitiesTab";
import { TimelineTab } from "./components/TimelineTab";
import { CalendarTab } from "./components/CalendarTab";
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

export function GroomingContent() {
  return (
    <Tabs defaultValue="dashboard" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="dashboard" leftSection={<IconLayoutDashboard size={16} />}>
          Dashboard
        </Tabs.Tab>
        <Tabs.Tab value="activities" leftSection={<IconList size={16} />}>
          Activities
        </Tabs.Tab>
        <Tabs.Tab value="timeline" leftSection={<IconTimelineEvent size={16} />}>
          Timeline
        </Tabs.Tab>
        <Tabs.Tab value="calendar" leftSection={<IconCalendar size={16} />}>
          Calendar
        </Tabs.Tab>
        <Tabs.Tab value="insights" leftSection={<IconGraph size={16} />}>
          Insights
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="md">
        <Suspense fallback={<TabFallback />}>
          <DashboardTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="activities" pt="md">
        <Suspense fallback={<TabFallback />}>
          <ActivitiesTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="timeline" pt="md">
        <Suspense fallback={<TabFallback />}>
          <TimelineTab />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="calendar" pt="md">
        <Suspense fallback={<TabFallback />}>
          <CalendarTab />
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
