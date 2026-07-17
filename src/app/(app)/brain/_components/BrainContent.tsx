"use client";

import { useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import { IconNotes, IconBulb, IconGraph } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "notes", label: "Notes", icon: IconNotes },
  { value: "ideas", label: "Ideas", icon: IconBulb },
  { value: "graph-view", label: "Graph View", icon: IconGraph },
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

export function BrainContent() {
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
      window.history.replaceState(null, "", `/brain${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
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
        <Suspense fallback={<TabFallback />}>
          <FeaturePlaceholder
            title="Notes"
            description="Your notes and quick captures"
            icon={IconNotes}
          />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="ideas">
        <Suspense fallback={<TabFallback />}>
          <FeaturePlaceholder
            title="Ideas"
            description="Capture and develop ideas"
            icon={IconBulb}
          />
        </Suspense>
      </Tabs.Panel>

      <Tabs.Panel value="graph-view">
        <Suspense fallback={<TabFallback />}>
          <FeaturePlaceholder
            title="Graph View"
            description="Visualize connections between your knowledge"
            icon={IconGraph}
          />
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}
