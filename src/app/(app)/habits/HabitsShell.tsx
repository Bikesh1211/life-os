"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconReportAnalytics,
  IconFlame,
  IconBulb,
} from "@tabler/icons-react";

const tabs = [
  { value: "/habits", label: "Dashboard", icon: IconReportAnalytics },
  { value: "/habits/streaks", label: "Streaks", icon: IconFlame },
  { value: "/habits/insights", label: "Insights", icon: IconBulb },
];

export function HabitsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname === t.value || pathname.startsWith(t.value + "/"))?.value ?? "/habits";

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
