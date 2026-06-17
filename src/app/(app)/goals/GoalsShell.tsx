"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconTarget,
  IconActivity,
  IconCheck,
  IconTemplate,
  IconReportAnalytics,
} from "@tabler/icons-react";

const tabs = [
  { value: "/goals", label: "Overview", icon: IconTarget },
  { value: "/goals/active", label: "Active", icon: IconActivity },
  { value: "/goals/completed", label: "Completed", icon: IconCheck },
  { value: "/goals/templates", label: "Templates", icon: IconTemplate },
  { value: "/goals/analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function GoalsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname.startsWith(t.value))?.value ?? "/goals";

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={(value) => value && router.push(value)}
        styles={{
          tab: {
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 500,
          },
        }}
      >
        <Tabs.List mb="lg">
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {children}
    </>
  );
}
