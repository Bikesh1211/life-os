"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { MovieCard } from "@/modules/movies/components/design-system/MovieCard";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { useRouter } from "next/navigation";

export function MoviesWatchedPanel() {
  const router = useRouter();
  const { data: items } = useQuery({
    queryKey: ["movie-watchlist", "completed"],
    queryFn: async () => {
      const res = await fetch("/api/movies/watchlist?status=completed");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <>
      <SectionHeading title="Watched" icon={<IconCircleCheck size={18} />} />

      {items?.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
          {items.map((item: any) => (
            <MovieCard
              key={item.id}
              imageUrl={item.mediaPosterUrl}
              title={item.mediaTitle ?? item.mediaId}
              onClick={() => router.push(`/movies/media/${item.mediaId}`)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">✅</div>
          <Text size="sm" c="dimmed">No watched movies yet. Mark movies as completed in your watchlist!</Text>
        </div>
      )}
    </>
  );
}
