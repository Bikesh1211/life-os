"use client";

import { Tabs, Stack } from "@mantine/core";
import { IconHeart, IconActivity, IconRun, IconApple } from "@tabler/icons-react";
import { HealthDashboard } from "./HealthDashboard";
import { VitalsContent } from "./vitals/VitalsContent";
import { FitnessContent } from "./fitness/FitnessContent";
import { NutritionContent } from "./nutrition/NutritionContent";
import type { HealthDashboard as HealthDashboardData, VitalsSnapshot, VitalsTrends, FitnessSummary, NutritionSummary } from "@/modules/health";

type Props = {
  dashboard: HealthDashboardData;
  vitalsSnapshot: VitalsSnapshot;
  vitalsTrends: VitalsTrends;
  fitness: FitnessSummary;
  nutrition: NutritionSummary;
};

export function HealthTabs({ dashboard, vitalsSnapshot, vitalsTrends, fitness, nutrition }: Props) {
  return (
    <Tabs defaultValue="overview" variant="pills">
      <Tabs.List mb="md" px="lg" pt="md">
        <Tabs.Tab value="overview" leftSection={<IconHeart size={16} />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="vitals" leftSection={<IconActivity size={16} />}>
          Vitals
        </Tabs.Tab>
        <Tabs.Tab value="fitness" leftSection={<IconRun size={16} />}>
          Fitness
        </Tabs.Tab>
        <Tabs.Tab value="nutrition" leftSection={<IconApple size={16} />}>
          Nutrition
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <HealthDashboard data={dashboard} />
      </Tabs.Panel>

      <Tabs.Panel value="vitals">
        <VitalsContent snapshot={vitalsSnapshot} trends={vitalsTrends} />
      </Tabs.Panel>

      <Tabs.Panel value="fitness">
        <FitnessContent summary={fitness} />
      </Tabs.Panel>

      <Tabs.Panel value="nutrition">
        <NutritionContent summary={nutrition} />
      </Tabs.Panel>
    </Tabs>
  );
}
