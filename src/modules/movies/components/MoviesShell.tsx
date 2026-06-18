"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "@mantine/core";
import {
  IconDashboard, IconSearch, IconHeart, IconListDetails,
  IconPhotoHeart, IconDeviceTv, IconMovie, IconQuote,
  IconPlaylist, IconReportAnalytics,
} from "@tabler/icons-react";

const tabs = [
  { value: "/movies", label: "Dashboard", icon: IconDashboard },
  { value: "/movies/discover", label: "Discover", icon: IconSearch },
  { value: "/movies/favorites", label: "Favorites", icon: IconHeart },
  { value: "/movies/watchlist", label: "Watchlist", icon: IconListDetails },
  { value: "/movies/memories", label: "Memories", icon: IconPhotoHeart },
  { value: "/movies/tv-shows", label: "TV Shows", icon: IconDeviceTv },
  { value: "/movies/anime", label: "Anime", icon: IconMovie },
  { value: "/movies/quotes", label: "Quotes", icon: IconQuote },
  { value: "/movies/collections", label: "Collections", icon: IconPlaylist },
  { value: "/movies/statistics", label: "Statistics", icon: IconReportAnalytics },
];

export function MoviesShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = tabs.find(
    (t) => pathname === t.value || pathname.startsWith(t.value + "/"),
  )?.value ?? "/movies";

  return (
    <>
      <Tabs value={currentTab} onChange={(val) => val && router.push(val)}>
        <Tabs.List mb="lg">
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      {children}
    </>
  );
}
