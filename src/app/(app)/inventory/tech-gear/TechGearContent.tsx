"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs, Container } from "@mantine/core";
import { IconLayoutDashboard, IconDeviceLaptop, IconComponents, IconTools } from "@tabler/icons-react";
import { TechGearDashboardPanel } from "./components/TechGearDashboardPanel";
import { TechGearItemsContent } from "./items/TechGearItemsContent";
import { TechSetupsPanel } from "./components/TechSetupsPanel";
import { TechMaintenancePanel } from "./components/TechMaintenancePanel";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { value: "items", label: "Items", icon: IconDeviceLaptop },
  { value: "setups", label: "Setups", icon: IconComponents },
  { value: "maintenance", label: "Maintenance", icon: IconTools },
];

export function TechGearContent({ defaultTab = "dashboard" }: Props) {
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
      router.replace(`/inventory/tech-gear${qs ? `?${qs}` : ""}`, { scroll: false });
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
            <TechGearDashboardPanel />
          </Tabs.Panel>

          <Tabs.Panel value="items" pt="md">
            <TechGearItemsContent />
          </Tabs.Panel>

          <Tabs.Panel value="setups" pt="md">
            <TechSetupsPanel />
          </Tabs.Panel>

          <Tabs.Panel value="maintenance" pt="md">
            <TechMaintenancePanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
