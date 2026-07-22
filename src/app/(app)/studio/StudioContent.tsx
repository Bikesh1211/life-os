"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconLayoutDashboard, IconFileText, IconMicrophone2, IconReportAnalytics,
} from "@tabler/icons-react";
import { DashboardContent } from "@/modules/scripts/components/DashboardContent";
import { ScriptsListContent } from "@/modules/scripts/components/ScriptsListContent";
import { PracticeHistoryContent } from "@/modules/scripts/components/PracticeHistoryContent";
import { AnalyticsContent } from "@/modules/scripts/components/AnalyticsContent";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "overview", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "scripts", label: "Scripts", icon: IconFileText },
  { value: "practice", label: "Practice", icon: IconMicrophone2 },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function StudioContent({ defaultTab = "overview" }: Props) {
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
      router.replace(`/studio${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              leftSection={<tab.icon size={16} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview">
          <DashboardContent />
        </Tabs.Panel>

        <Tabs.Panel value="scripts">
          <ScriptsListContent />
        </Tabs.Panel>

        <Tabs.Panel value="practice">
          <PracticeHistoryContent />
        </Tabs.Panel>

        <Tabs.Panel value="analytics">
          <AnalyticsContent />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
