"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { IconRepeat, IconCopy, IconCalendarTime, IconReportAnalytics } from "@tabler/icons-react";

const tabs = [
  { value: "/routines", label: "Dashboard", icon: IconRepeat },
  { value: "/routines/templates", label: "Templates", icon: IconCopy },
  { value: "/routines/timeline", label: "Timeline", icon: IconCalendarTime },
  { value: "/routines/analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function RoutinesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => {
    if (t.value === "/routines") return pathname === "/routines";
    return pathname.startsWith(t.value);
  })?.value ?? "/routines";

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
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              leftSection={<tab.icon size={18} />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {children}
    </>
  );
}
