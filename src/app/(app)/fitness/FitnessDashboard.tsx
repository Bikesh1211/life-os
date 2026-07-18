"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconRun, IconCalendarBolt, IconBarbell, IconDimensions,
  IconChartLine, IconFlame,
} from "@tabler/icons-react";
import { FitnessOverviewTab } from "./FitnessOverviewTab";
import { FitnessWorkoutsTab } from "./FitnessWorkoutsTab";
import { FitnessProgramsTab } from "./FitnessProgramsTab";
import { FitnessMeasurementsTab } from "./FitnessMeasurementsTab";
import { FitnessProgressTab } from "./FitnessProgressTab";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "overview", label: "Overview", icon: IconRun },
  { value: "workouts", label: "Workouts", icon: IconCalendarBolt },
  { value: "programs", label: "Programs", icon: IconBarbell },
  { value: "measurements", label: "Measurements", icon: IconDimensions },
  { value: "progress", label: "Progress", icon: IconChartLine },
];

export function FitnessDashboard({ defaultTab = "overview" }: Props) {
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
      router.replace(`/fitness${qs ? `?${qs}` : ""}`, { scroll: false });
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

        <Tabs.Panel value="overview" pt="md">
          <FitnessOverviewTab />
        </Tabs.Panel>

        <Tabs.Panel value="workouts" pt="md">
          <FitnessWorkoutsTab />
        </Tabs.Panel>

        <Tabs.Panel value="programs" pt="md">
          <FitnessProgramsTab />
        </Tabs.Panel>

        <Tabs.Panel value="measurements" pt="md">
          <FitnessMeasurementsTab />
        </Tabs.Panel>

        <Tabs.Panel value="progress" pt="md">
          <FitnessProgressTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
