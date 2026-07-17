"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Container, Skeleton } from "@mantine/core";
import { IconLayoutDashboard, IconDeviceLaptop, IconComponents, IconTools } from "@tabler/icons-react";

const TechGearDashboardPanel = lazy(() => import("./components/TechGearDashboardPanel").then(m => ({ default: m.TechGearDashboardPanel })));
const TechGearItemsContent = lazy(() => import("./items/TechGearItemsContent").then(m => ({ default: m.TechGearItemsContent })));
const TechSetupsPanel = lazy(() => import("./components/TechSetupsPanel").then(m => ({ default: m.TechSetupsPanel })));
const TechMaintenancePanel = lazy(() => import("./components/TechMaintenancePanel").then(m => ({ default: m.TechMaintenancePanel })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "items", label: "Items", icon: IconDeviceLaptop },
  { value: "setups", label: "Setups", icon: IconComponents },
  { value: "maintenance", label: "Maintenance", icon: IconTools },
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

export function TechGearContent({ defaultTab = "dashboard" }: Props) {
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
      window.history.replaceState(null, "", `/inventory/tech-gear${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panel value="dashboard" pt="md">
            <Suspense fallback={<TabFallback />}>
              <TechGearDashboardPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <Suspense fallback={<TabFallback />}>
              <TechGearItemsContent />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="setups" pt="md">
            <Suspense fallback={<TabFallback />}>
              <TechSetupsPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="maintenance" pt="md">
            <Suspense fallback={<TabFallback />}>
              <TechMaintenancePanel />
            </Suspense>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
