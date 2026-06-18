"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconSchool, IconGridPattern, IconBooks } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

const tabs = [
  { value: "skill-matrix", label: "Skill Matrix", icon: IconGridPattern },
  { value: "courses", label: "Courses", icon: IconBooks },
];

export function LearningContent() {
  const router = useRouter();
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
      router.replace(`/learning${qs ? `?${qs}` : ""}`, { scroll: false });
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

      <Tabs.Panel value="skill-matrix">
        <FeaturePlaceholder title="Skill Matrix" description="Track your skills and competencies" icon={IconGridPattern} />
      </Tabs.Panel>
      <Tabs.Panel value="courses">
        <FeaturePlaceholder title="Courses" description="Manage your learning courses" icon={IconBooks} />
      </Tabs.Panel>
    </Tabs>
  );
}
