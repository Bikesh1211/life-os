"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Badge, Group, Progress } from "@mantine/core";
import { IconDeviceTv } from "@tabler/icons-react";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";

export function TvShowsContent() {
  const { data: watchlist } = useQuery({
    queryKey: ["movie-watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/movies/watchlist");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const tvShows = watchlist?.filter((w: any) => !w.mediaId?.startsWith("movie-")) ?? [];

  return (
    <div>
      <SectionHeading title="TV Shows" icon={<IconDeviceTv size={18} />} />

      {tvShows.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {tvShows.map((show: any) => {
            const progress = show.totalEpisodes && show.totalEpisodes > 0
              ? Math.round(((show.currentEpisode ?? 0) / show.totalEpisodes) * 100)
              : 0;

            return (
              <div key={show.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <Group justify="space-between" mb={4}>
                  <Text fw={600} c="white" size="sm">{show.mediaId}</Text>
                  <Badge size="sm">{show.status?.replace(/_/g, " ")}</Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="sm">
                  Season {show.currentSeason ?? 1} · Episode {show.currentEpisode ?? 0}
                  {show.totalEpisodes ? ` / ${show.totalEpisodes}` : ""}
                </Text>
                {progress > 0 && <Progress value={progress} size="sm" color="blue" />}
                <Text size="xs" c="dimmed" mt={2}>{progress}% completed</Text>
                {show.notes && <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{show.notes}</Text>}
              </div>
            );
          })}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">📺</div>
          <Text size="sm" c="dimmed">No TV shows in your watchlist. Discover and add TV shows to track your progress!</Text>
        </div>
      )}
    </div>
  );
}
