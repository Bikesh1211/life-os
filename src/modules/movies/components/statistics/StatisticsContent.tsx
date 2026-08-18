"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Title, Group, Skeleton } from "@mantine/core";
import { IconReportAnalytics, IconHeart, IconPhotoHeart, IconListCheck, IconStar, IconQuote } from "@tabler/icons-react";
import { StatCard } from "@/modules/movies/components/design-system/StatCard";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { apiFetch } from "@/core/api/http";

export function StatisticsContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["movie-statistics"],
    queryFn: () => apiFetch<any>("/api/movies/statistics"),
  });

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} h={100} radius="md" />)}
      </SimpleGrid>
    );
  }

  return (
    <div>
      <SectionHeading title="Statistics" icon={<IconReportAnalytics size={18} />} />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
        <StatCard label="Favorites" value={stats?.favoritesCount ?? 0} icon={<IconHeart size={20} />} />
        <StatCard label="Memories" value={stats?.memoriesCount ?? 0} icon={<IconPhotoHeart size={20} />} />
        <StatCard label="Completed" value={stats?.completedCount ?? 0} icon={<IconListCheck size={20} />} />
        <StatCard label="Ratings" value={stats?.ratingsCount ?? 0} icon={<IconStar size={20} />} />
        <StatCard label="Quotes" value={stats?.totalQuotes ?? 0} icon={<IconQuote size={20} />} />
        <StatCard label="Collections" value={stats?.totalCollections ?? 0} icon={<IconQuote size={20} />} />
        <StatCard label="Currently Watching" value={stats?.watchingCount ?? 0} icon={<IconListCheck size={20} />} />
        <StatCard label="Avg Rating" value={stats?.averageRating ?? 0} icon={<IconStar size={20} />} />
      </SimpleGrid>

      {stats?.memoriesPerMonth?.length > 0 && (
        <div>
          <Title order={4} c="white" mb="sm">Memories Per Month</Title>
          <div className="space-y-2">
            {stats.memoriesPerMonth.map((m: any) => (
              <div key={m.month} className="flex items-center gap-3">
                <Text size="sm" c="dimmed" w={80}>{m.month}</Text>
                <div className="h-5 rounded bg-blue-600 transition-all" style={{ width: `${Math.min(m.count * 20, 100)}%` }} />
                <Text size="xs" c="dimmed">{m.count}</Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {(stats?.favoritesCount ?? 0) === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <Text size="sm" c="dimmed">No data yet. Start using the Movies module to see your statistics!</Text>
        </div>
      )}
    </div>
  );
}