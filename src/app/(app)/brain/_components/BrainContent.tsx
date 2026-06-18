"use client";

import { useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import { IconNotes, IconBulb, IconGraph } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "notes", label: "Notes", icon: IconNotes },
  { value: "ideas", label: "Ideas", icon: IconBulb },
  { value: "graph-view", label: "Graph View", icon: IconGraph },
];

export function BrainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "notes";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "notes") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      router.replace(`/brain${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List mb="lg">
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={<tab.icon size={18} />}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="notes">
        <FeaturePlaceholder
          title="Notes"
          description="Your notes and quick captures"
          icon={IconNotes}
        />
      </Tabs.Panel>

      <Tabs.Panel value="ideas">
        <FeaturePlaceholder
          title="Ideas"
          description="Capture and develop ideas"
          icon={IconBulb}
        />
      </Tabs.Panel>

      <Tabs.Panel value="graph-view">
        <FeaturePlaceholder
          title="Graph View"
          description="Visualize connections between your knowledge"
          icon={IconGraph}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
