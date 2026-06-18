"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconUsers, IconUserPlus, IconCake } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "connections", label: "Connections", icon: IconUserPlus },
  { value: "birthdays", label: "Birthdays", icon: IconCake },
];

export function NetworkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "connections";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "connections") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      router.replace(`/network${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List mb="lg">
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="connections">
        <FeaturePlaceholder title="Connections" description="Manage your network connections" icon={IconUserPlus} />
      </Tabs.Panel>
      <Tabs.Panel value="birthdays">
        <FeaturePlaceholder title="Birthdays" description="Birthday calendar and reminders" icon={IconCake} />
      </Tabs.Panel>
    </Tabs>
  );
}
