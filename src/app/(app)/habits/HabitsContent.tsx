"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import { IconReportAnalytics, IconFlame, IconBulb } from "@tabler/icons-react";
import { AnalyticsPage } from "@/modules/habits/components/analytics/AnalyticsPage";
import { StreaksPanel } from "./components/StreaksPanel";
import { InsightsPanel } from "./components/InsightsPanel";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconReportAnalytics },
  { value: "streaks", label: "Streaks", icon: IconFlame },
  { value: "insights", label: "Insights", icon: IconBulb },
];

export function HabitsContent({ defaultTab = "dashboard" }: Props) {
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
      router.replace(`/habits${qs ? `?${qs}` : ""}`, { scroll: false });
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
          <AnalyticsPage />
        </Tabs.Panel>

        <Tabs.Panel value="streaks" pt="md">
          <StreaksPanel />
        </Tabs.Panel>

        <Tabs.Panel value="insights" pt="md">
          <InsightsPanel />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
