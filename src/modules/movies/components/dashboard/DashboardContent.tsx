"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text, Skeleton } from "@mantine/core";
import { IconHeart, IconPhotoHeart, IconListCheck, IconQuote, IconPlaylist } from "@tabler/icons-react";
import { StatCard } from "@/modules/movies/components/design-system/StatCard";
import Link from "next/link";
import { apiFetch } from "@/core/api/http";

export function DashboardContent() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ["movies-dashboard"],
    queryFn: () => apiFetch<any>("/api/movies/dashboard"),
  });

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={100} radius="md" />)}
      </SimpleGrid>
    );
  }

  return (
    <div>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md" mb="xl">
        <StatCard label="Favorites" value={dash?.stats?.totalFavorites ?? 0} icon={<IconHeart size={20} />} />
        <StatCard label="Memories" value={dash?.stats?.totalMemories ?? 0} icon={<IconPhotoHeart size={20} />} />
        <StatCard label="Completed" value={dash?.stats?.totalCompleted ?? 0} icon={<IconListCheck size={20} />} />
        <StatCard label="Quotes" value={dash?.stats?.totalQuotes ?? 0} icon={<IconQuote size={20} />} />
        <StatCard label="Collections" value={dash?.stats?.totalCollections ?? 0} icon={<IconPlaylist size={20} />} />
      </SimpleGrid>

      {dash?.recentMemories?.length > 0 && (
        <div>
          <Text fw={600} size="lg" c="white" mb="sm">Recently Watched</Text>
          <div className="space-y-3">
            {dash.recentMemories.slice(0, 5).map((m: any) => (
              <Link key={m.id} href={m.mediaId ? `/movies/media/${m.mediaId}` : `/movies/memories/${m.id}`} className="no-underline">
                <div className="flex gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-all hover:shadow-md">
                  {m.mediaPosterUrl ? (
                    <img src={m.mediaPosterUrl} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--mantine-color-dark-6)] text-lg">🎬</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Text size="sm" fw={600} c="white">{m.title ?? "Untitled"}</Text>
                    {m.mediaTitle && <Text size="xs" c="blue" mb={2}>{m.mediaTitle}</Text>}
                    <Text size="xs" c="dimmed" lineClamp={2}>{m.contextText}</Text>
                    {m.watchDate && <Text size="xs" c="dimmed" mt={2}>{new Date(m.watchDate).toLocaleDateString()}</Text>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!dash?.recentMemories || dash.recentMemories.length === 0) && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">🎬</div>
          <Text size="sm" c="dimmed">Welcome to your Movies Dashboard! Start by discovering movies and creating memories.</Text>
        </div>
      )}
    </div>
  );
}
