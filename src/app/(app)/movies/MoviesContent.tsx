"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconDashboard, IconSearch, IconHeart, IconListDetails,
  IconCircleCheck, IconPhotoHeart, IconQuote,
  IconPlaylist, IconReportAnalytics,
} from "@tabler/icons-react";
import { DashboardContent } from "@/modules/movies/components/dashboard/DashboardContent";
import { DiscoverContent } from "@/modules/movies/components/discover/DiscoverContent";
import { FavoritesContent } from "@/modules/movies/components/favorites/FavoritesContent";
import { WatchlistContent } from "@/modules/movies/components/watchlist/WatchlistContent";
import { MemoriesContent } from "@/modules/movies/components/memories/MemoriesContent";
import { QuotesContent } from "@/modules/movies/components/quotes/QuotesContent";
import { CollectionsContent } from "@/modules/movies/components/collections/CollectionsContent";
import { StatisticsContent } from "@/modules/movies/components/statistics/StatisticsContent";
import { MoviesWatchedPanel } from "./components/MoviesWatchedPanel";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: IconDashboard },
  { value: "discover", label: "Discover", icon: IconSearch },
  { value: "favorites", label: "Favorites", icon: IconHeart },
  { value: "watchlist", label: "Watchlist", icon: IconListDetails },
  { value: "watched", label: "Watched", icon: IconCircleCheck },
  { value: "memories", label: "Memories", icon: IconPhotoHeart },
  { value: "quotes", label: "Quotes", icon: IconQuote },
  { value: "collections", label: "Collections", icon: IconPlaylist },
  { value: "statistics", label: "Statistics", icon: IconReportAnalytics },
];

export function MoviesContent({ defaultTab = "dashboard" }: Props) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "dashboard") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `/movies${qs ? `?${qs}` : ""}`);
    },
    [searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="md">
          <DashboardContent />
        </Tabs.Panel>

        <Tabs.Panel value="discover" pt="md">
          <DiscoverContent />
        </Tabs.Panel>

        <Tabs.Panel value="favorites" pt="md">
          <FavoritesContent />
        </Tabs.Panel>

        <Tabs.Panel value="watchlist" pt="md">
          <WatchlistContent />
        </Tabs.Panel>

        <Tabs.Panel value="watched" pt="md">
          <MoviesWatchedPanel />
        </Tabs.Panel>

        <Tabs.Panel value="memories" pt="md">
          <MemoriesContent />
        </Tabs.Panel>

        <Tabs.Panel value="quotes" pt="md">
          <QuotesContent />
        </Tabs.Panel>

        <Tabs.Panel value="collections" pt="md">
          <CollectionsContent />
        </Tabs.Panel>

        <Tabs.Panel value="statistics" pt="md">
          <StatisticsContent />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
