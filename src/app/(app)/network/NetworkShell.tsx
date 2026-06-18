"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconUsers,
  IconUserPlus,
  IconCake,
  IconCoffee,
  IconPlane,
  IconPhotoHeart,
  IconGift,
  IconCalendarEvent,
  IconTimelineEvent,
  IconReportAnalytics,
} from "@tabler/icons-react";

const tabs = [
  { value: "/network", label: "Overview", icon: IconUsers },
  { value: "/network/connections", label: "Connections", icon: IconUserPlus },
  { value: "/network/birthdays", label: "Birthdays", icon: IconCake },
  { value: "/network/meetups", label: "Meetups", icon: IconCoffee },
  { value: "/network/trips", label: "Trips", icon: IconPlane },
  { value: "/network/memories", label: "Memories", icon: IconPhotoHeart },
  { value: "/network/gifts", label: "Gifts", icon: IconGift },
  { value: "/network/events", label: "Events", icon: IconCalendarEvent },
  { value: "/network/timeline", label: "Timeline", icon: IconTimelineEvent },
  { value: "/network/insights", label: "Insights", icon: IconReportAnalytics },
];

export function NetworkShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = tabs.find((t) => pathname === t.value || pathname.startsWith(t.value + "/"))?.value ?? "/network";

  return (
    <>
      <Tabs value={currentTab} onChange={(value) => value && router.push(value)}>
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
