"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import { IconRoute, IconMap2 } from "@tabler/icons-react";
import { RoutesTab } from "./components/RoutesTab";
import { PlannerTab } from "./components/PlannerTab";

const tabs = [
  { value: "routes", label: "Routes", icon: IconRoute },
  { value: "planner", label: "Planner", icon: IconMap2 },
];

export function TravelHelperContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? "routes",
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "routes") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/travel-helper${qs ? `?${qs}` : ""}`, { scroll: false });
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

        <Tabs.Panel value="routes" pt="md">
          <RoutesTab />
        </Tabs.Panel>

        <Tabs.Panel value="planner" pt="md">
          <PlannerTab />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
