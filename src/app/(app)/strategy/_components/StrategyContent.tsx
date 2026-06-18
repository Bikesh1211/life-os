"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconChess, IconEye, IconScale, IconCompass } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "vision", label: "Vision", icon: IconEye },
  { value: "decisions", label: "Decisions", icon: IconScale },
  { value: "principles", label: "Principles", icon: IconCompass },
];

export function StrategyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "vision";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "vision") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      router.replace(`/strategy${qs ? `?${qs}` : ""}`, { scroll: false });
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

      <Tabs.Panel value="vision">
        <FeaturePlaceholder title="Vision" description="Define your life vision" icon={IconEye} />
      </Tabs.Panel>
      <Tabs.Panel value="decisions">
        <FeaturePlaceholder title="Decisions" description="Decision log and reflections" icon={IconScale} />
      </Tabs.Panel>
      <Tabs.Panel value="principles">
        <FeaturePlaceholder title="Principles" description="Your life principles" icon={IconCompass} />
      </Tabs.Panel>
    </Tabs>
  );
}
