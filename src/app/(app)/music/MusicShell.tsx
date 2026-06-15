"use client";

import { Tabs } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconMusic,
  IconBooks,
  IconHeart,
  IconPlaylist,
  IconPhotoHeart,
  IconBook,
  IconRepeat,
  IconReportAnalytics,
} from "@tabler/icons-react";

const tabs = [
  { value: "/music", label: "Overview", icon: IconMusic },
  { value: "/music/library", label: "Library", icon: IconBooks },
  { value: "/music/favorites", label: "Favorites", icon: IconHeart },
  { value: "/music/collections", label: "Collections", icon: IconPlaylist },
  { value: "/music/memories", label: "Memories", icon: IconPhotoHeart },
  { value: "/music/journal", label: "Journal", icon: IconBook },
  { value: "/music/history", label: "History", icon: IconRepeat },
  { value: "/music/analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function MusicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname.startsWith(t.value))?.value ?? "/music";

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
