"use client";

import { lazy, Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, Skeleton, Paper } from "@mantine/core";
import { IconSchool, IconGridPattern, IconBooks, IconLanguage } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const EnglishContent = lazy(() => import("./english/EnglishContent").then(m => ({ default: m.EnglishContent })));

const tabs = [
  { value: "skill-matrix", label: "Skill Matrix", icon: IconGridPattern },
  { value: "courses", label: "Courses", icon: IconBooks },
  { value: "english", label: "English", icon: IconLanguage },
];

function TabSkeleton() {
  return (
    <Paper p="xl" radius="md">
      <Skeleton height={40} mb="md" width={200} />
      <Skeleton height={20} mb="sm" />
      <Skeleton height={20} mb="sm" />
      <Skeleton height={200} radius="md" />
    </Paper>
  );
}

export function LearningContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "skill-matrix";
  const [tab, setTab] = useState(activeTab);

  const handleTabChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setTab(value);
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
    <Tabs value={tab} onChange={handleTabChange} keepMounted={false}>
      <Tabs.List mb="lg">
        {tabs.map((t) => (
          <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={18} />}>
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="skill-matrix">
        <FeaturePlaceholder title="Skill Matrix" description="Track your skills and competencies" icon={IconGridPattern} />
      </Tabs.Panel>
      <Tabs.Panel value="courses">
        <FeaturePlaceholder title="Courses" description="Manage your learning courses" icon={IconBooks} />
      </Tabs.Panel>
      <Tabs.Panel value="english">
        <Suspense fallback={<TabSkeleton />}>
          <EnglishContent />
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}
