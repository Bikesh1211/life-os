"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Badge, Group } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";

const statusColors: Record<string, string> = {
  plan_to_watch: "gray", watching: "blue", completed: "green", dropped: "red", rewatching: "yellow",
};

export function WatchlistContent() {
  const { data: watchlist } = useQuery({
    queryKey: ["movie-watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/movies/watchlist");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (!watchlist || watchlist.length === 0) {
    return (
      <div>
        <SectionHeading title="Watchlist" icon={<IconListDetails size={18} />} />
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">📋</div>
          <Text size="sm" c="dimmed">Your watchlist is empty. Add movies and TV shows you plan to watch!</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading title="Watchlist" icon={<IconListDetails size={18} />} />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {watchlist.map((item: any) => (
          <div key={item.id} className="rounded-xl border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-body)] p-4">
            <Group justify="space-between" mb={4}>
              <Text fw={600} c="white" size="sm">{item.mediaId}</Text>
              <Badge size="sm" color={statusColors[item.status]}>{item.status.replace(/_/g, " ")}</Badge>
            </Group>
            {(item.currentEpisode ?? 0) > 0 && (
              <Text size="xs" c="dimmed">
                {item.totalSeasons && `S${item.currentSeason ?? 1} · `}
                E{item.currentEpisode ?? 0}{item.totalEpisodes ? ` / ${item.totalEpisodes}` : ""}
              </Text>
            )}
            {item.notes && <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{item.notes}</Text>}
          </div>
        ))}
      </SimpleGrid>
    </div>
  );
}
