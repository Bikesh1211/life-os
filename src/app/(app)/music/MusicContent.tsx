"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stack, Tabs } from "@mantine/core";
import {
  IconMusic, IconBooks, IconHeart, IconPlaylist,
  IconPhotoHeart, IconBook, IconRepeat, IconReportAnalytics,
} from "@tabler/icons-react";
import { MusicHome } from "@/modules/music/components/home/MusicHome";
import { LibraryContent } from "@/modules/music/components/library/LibraryContent";
import { FavoritesContent } from "@/modules/music/components/favorites/FavoritesContent";
import { CollectionsContent } from "@/modules/music/components/collections/CollectionsContent";
import { MemoriesContent } from "@/modules/music/components/memory/MemoriesContent";
import { JournalContent } from "@/modules/music/components/journal/JournalContent";
import { HistoryContent } from "@/modules/music/components/history/HistoryContent";
import { AnalyticsContent } from "@/modules/music/components/analytics/AnalyticsContent";

type Props = {
  defaultTab?: string;
};

const tabs = [
  { value: "overview", label: "Overview", icon: IconMusic },
  { value: "library", label: "Library", icon: IconBooks },
  { value: "favorites", label: "Favorites", icon: IconHeart },
  { value: "collections", label: "Collections", icon: IconPlaylist },
  { value: "memories", label: "Memories", icon: IconPhotoHeart },
  { value: "journal", label: "Journal", icon: IconBook },
  { value: "history", label: "History", icon: IconRepeat },
  { value: "analytics", label: "Analytics", icon: IconReportAnalytics },
];

export function MusicContent({ defaultTab = "overview" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get("tab") ?? defaultTab,
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "overview") {
        params.set("tab", value);
      } else {
        params.delete("tab");
      }
      const qs = params.toString();
      router.replace(`/music${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={18} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <MusicHome />
        </Tabs.Panel>

        <Tabs.Panel value="library" pt="md">
          <LibraryContent />
        </Tabs.Panel>

        <Tabs.Panel value="favorites" pt="md">
          <FavoritesContent />
        </Tabs.Panel>

        <Tabs.Panel value="collections" pt="md">
          <CollectionsContent />
        </Tabs.Panel>

        <Tabs.Panel value="memories" pt="md">
          <MemoriesContent />
        </Tabs.Panel>

        <Tabs.Panel value="journal" pt="md">
          <JournalContent />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <HistoryContent />
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <AnalyticsContent />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
