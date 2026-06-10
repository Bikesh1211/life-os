"use client";

import { Tabs, Container, rem } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconMusic,
  IconBooks,
  IconHeart,
  IconPlaylist,
  IconPhotoHeart,
} from "@tabler/icons-react";

const tabs = [
  { value: "/music", label: "Overview", icon: IconMusic },
  { value: "/music/library", label: "Library", icon: IconBooks },
  { value: "/music/favorites", label: "Favorites", icon: IconHeart },
  { value: "/music/collections", label: "Collections", icon: IconPlaylist },
  { value: "/music/memories", label: "Memories", icon: IconPhotoHeart },
];

export function MusicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find((t) => pathname === t.value || pathname.startsWith(t.value + "/"))
    ?.value ?? "/music";

  return (
    <Container size="xl" py="md">
      <Tabs
        value={currentTab}
        onChange={(value) => value && router.push(value)}
        styles={{
          tab: {
            padding: `${rem(8)} ${rem(16)}`,
            fontSize: rem(14),
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
    </Container>
  );
}
