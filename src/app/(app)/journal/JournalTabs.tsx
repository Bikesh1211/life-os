"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconTimeline, IconBrain } from "@tabler/icons-react";

const TABS = [
  { value: "list", label: "Entries", route: "/journal", icon: null },
  { value: "timeline", label: "Timeline", route: "/journal/timeline", icon: IconTimeline },
  { value: "insights", label: "Insights", route: "/journal/insights", icon: IconBrain },
] as const;

export function JournalTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = TABS.find((t) => pathname.startsWith(t.route))?.value ?? "list";

  function handleTabChange(value: string | null) {
    const tab = TABS.find((t) => t.value === value);
    if (tab) router.push(tab.route);
  }

  return (
    <Tabs value={currentTab} onChange={handleTabChange} className="mb-4">
      <Tabs.List>
        {TABS.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value} leftSection={tab.icon ? <tab.icon size={16} /> : undefined}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
