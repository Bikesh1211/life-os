"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs, Container } from "@mantine/core";
import { IconLayoutDashboard, IconShirt, IconPalette, IconBackpack, IconChartBar } from "@tabler/icons-react";
import { WardrobeDashboardPanel } from "./components/WardrobeDashboardPanel";
import { WardrobeItemsContent } from "./items/WardrobeItemsContent";
import { WardrobeOutfitsPanel } from "./components/WardrobeOutfitsPanel";
import { WardrobePackingPanel } from "./components/WardrobePackingPanel";
import { WardrobeAnalyticsPanel } from "./components/WardrobeAnalyticsPanel";

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

export function WardrobeContent({ defaultTab = "dashboard" }: Props) {
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
      router.replace(`/inventory/wardrobe${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
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
            <WardrobeDashboardPanel />
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <WardrobeItemsContent />
          </Tabs.Panel>

          <Tabs.Panel value="outfits" pt="md">
            <WardrobeOutfitsPanel />
          </Tabs.Panel>

          <Tabs.Panel value="packing" pt="md">
            <WardrobePackingPanel />
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            <WardrobeAnalyticsPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
