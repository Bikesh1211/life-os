"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChecklist,
  IconCalendarDue,
  IconInbox,
  IconFolder,
  IconRepeat,
  IconTags,
  IconFocusCentered,
} from "@tabler/icons-react";

const tabs = [
  { value: "/tasks", label: "Dashboard", icon: IconChecklist },
  { value: "/tasks/today", label: "Today", icon: IconCalendarDue },
  { value: "/tasks/inbox", label: "Inbox", icon: IconInbox },
  { value: "/tasks/projects", label: "Projects", icon: IconFolder },
  { value: "/tasks/upcoming", label: "Upcoming", icon: IconCalendarDue },
  { value: "/tasks/recurring", label: "Recurring", icon: IconRepeat },
  { value: "/tasks/labels", label: "Labels", icon: IconTags },
  { value: "/tasks/focus-mode", label: "Focus Mode", icon: IconFocusCentered },
];

export function TasksShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => {
    if (t.value === "/tasks") return pathname === "/tasks";
    return pathname.startsWith(t.value);
  })?.value ?? "/tasks";

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