"use client";

import { useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Stack } from "@mantine/core";
import { IconSchool, IconGridPattern, IconBooks } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "skill-matrix", label: "Skill Matrix", icon: IconGridPattern },
  { value: "courses", label: "Courses", icon: IconBooks },
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

export function LearningContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "skill-matrix";

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value === "skill-matrix") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/learning${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
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

      <Tabs.Panel value="skill-matrix">
        <Suspense fallback={<TabFallback />}>
          <FeaturePlaceholder title="Skill Matrix" description="Track your skills and competencies" icon={IconGridPattern} />
        </Suspense>
      </Tabs.Panel>
      <Tabs.Panel value="courses">
        <Suspense fallback={<TabFallback />}>
          <FeaturePlaceholder title="Courses" description="Manage your learning courses" icon={IconBooks} />
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}
