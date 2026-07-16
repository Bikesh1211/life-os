"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconList,
  IconCalendar,
  IconTimelineEvent,
  IconReportAnalytics,
  IconBulb,
} from "@tabler/icons-react";
import { DashboardTab } from "./components/DashboardTab";
import { HabitsTab } from "./components/HabitsTab";
import { CalendarTab } from "./components/CalendarTab";
import { TimelineTab } from "./components/TimelineTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { InsightsTab } from "./components/InsightsTab";

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "habits", label: "Habits", icon: IconList },
  { value: "calendar", label: "Calendar", icon: IconCalendar },
  { value: "timeline", label: "Timeline", icon: IconTimelineEvent },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
  { value: "insights", label: "Insights", icon: IconBulb },
];

export function CurbContent() {
  const router = useRouter();
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
      router.replace(`/curb${qs ? `?${qs}` : ""}`, { scroll: false });
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
          <DashboardTab />
        </Tabs.Panel>

        <Tabs.Panel value="habits" pt="md">
          <HabitsTab />
        </Tabs.Panel>

        <Tabs.Panel value="calendar" pt="md">
          <CalendarTab />
        </Tabs.Panel>

        <Tabs.Panel value="timeline" pt="md">
          <TimelineTab />
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <AnalyticsTab />
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          <InsightsTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
