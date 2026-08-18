"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Badge, Group, Progress } from "@mantine/core";
import { IconMovie } from "@tabler/icons-react";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { apiFetch } from "@/core/api/http";

export function AnimeContent() {
  const { data: watchlist } = useQuery({
    queryKey: ["movie-anime"],
    queryFn: () => apiFetch<any[]>("/api/movies/watchlist"),
  });

  const anime = watchlist?.filter((w: any) => w.tags?.includes("anime") ?? false) ?? [];

  return (
    <div>
      <SectionHeading title="Anime" icon={<IconMovie size={18} />} />

      {anime.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {anime.map((a: any) => {
            const progress = a.totalEpisodes && a.totalEpisodes > 0
              ? Math.round(((a.currentEpisode ?? 0) / a.totalEpisodes) * 100)
              : 0;

            return (
              <div key={a.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <Group justify="space-between" mb={4}>
                  <Text fw={600} c="white" size="sm">{a.mediaId}</Text>
                  <Badge size="sm">{a.status?.replace(/_/g, " ")}</Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="sm">
                  Episode {a.currentEpisode ?? 0}{a.totalEpisodes ? ` / ${a.totalEpisodes}` : ""}
                </Text>
                {progress > 0 && <Progress value={progress} size="sm" color="violet" />}
                <Text size="xs" c="dimmed" mt={2}>{progress}% completed</Text>
              </div>
            );
          })}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">🎌</div>
          <Text size="sm" c="dimmed">No anime in your watchlist. Add anime to track your progress!</Text>
        </div>
      )}
    </div>
  );
}