"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Skeleton } from "@mantine/core";
import { IconReportAnalytics, IconFlame, IconBulb } from "@tabler/icons-react";
import { HabitQuickLogModal } from "./components/HabitQuickLogModal";

const AnalyticsPage = lazy(() => import("@/modules/habits/components/analytics/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const StreaksPanel = lazy(() => import("./components/StreaksPanel").then(m => ({ default: m.StreaksPanel })));
const InsightsPanel = lazy(() => import("./components/InsightsPanel").then(m => ({ default: m.InsightsPanel })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconReportAnalytics },
  { value: "streaks", label: "Streaks", icon: IconFlame },
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

export function HabitsContent({ defaultTab = "dashboard" }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "log") {
      setShowLog(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      window.history.replaceState(null, "", `/habits${params.toString() ? `?${params}` : ""}`);
    }
  }, [searchParams]);

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
      window.history.replaceState(null, "", `/habits${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <>
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
              <AnalyticsPage />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="streaks" pt="md">
            <Suspense fallback={<TabFallback />}>
              <StreaksPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="insights" pt="md">
            <Suspense fallback={<TabFallback />}>
              <InsightsPanel />
            </Suspense>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <HabitQuickLogModal opened={showLog} onClose={() => setShowLog(false)} />
    </>
  );
}
