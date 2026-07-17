"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs, Container, Skeleton } from "@mantine/core";
import { IconLayoutDashboard, IconShirt, IconPalette, IconBackpack, IconChartBar } from "@tabler/icons-react";

const WardrobeDashboardPanel = lazy(() => import("./components/WardrobeDashboardPanel").then(m => ({ default: m.WardrobeDashboardPanel })));
const WardrobeItemsContent = lazy(() => import("./items/WardrobeItemsContent").then(m => ({ default: m.WardrobeItemsContent })));
const WardrobeOutfitsPanel = lazy(() => import("./components/WardrobeOutfitsPanel").then(m => ({ default: m.WardrobeOutfitsPanel })));
const WardrobePackingPanel = lazy(() => import("./components/WardrobePackingPanel").then(m => ({ default: m.WardrobePackingPanel })));
const WardrobeAnalyticsPanel = lazy(() => import("./components/WardrobeAnalyticsPanel").then(m => ({ default: m.WardrobeAnalyticsPanel })));

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "items", label: "Items", icon: IconShirt },
  { value: "outfits", label: "Outfits", icon: IconPalette },
  { value: "packing", label: "Packing", icon: IconBackpack },
  { value: "analytics", label: "Analytics", icon: IconChartBar },
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

export function WardrobeContent({ defaultTab = "dashboard" }: Props) {
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
      window.history.replaceState(null, "", `/inventory/wardrobe${qs ? `?${qs}` : ""}`);
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
              <WardrobeDashboardPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <Suspense fallback={<TabFallback />}>
              <WardrobeItemsContent />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="outfits" pt="md">
            <Suspense fallback={<TabFallback />}>
              <WardrobeOutfitsPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="packing" pt="md">
            <Suspense fallback={<TabFallback />}>
              <WardrobePackingPanel />
            </Suspense>
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            <Suspense fallback={<TabFallback />}>
              <WardrobeAnalyticsPanel />
            </Suspense>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
