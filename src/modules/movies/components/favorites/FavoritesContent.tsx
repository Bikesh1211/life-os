"use client";

import { useQuery } from "@tanstack/react-query";
import { SimpleGrid, Text } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import { MovieCard } from "@/modules/movies/components/design-system/MovieCard";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import { useRouter } from "next/navigation";

export function FavoritesContent() {
  const router = useRouter();
  const { data: favorites } = useQuery({
    queryKey: ["movie-favorites"],
    queryFn: async () => {
      const res = await fetch("/api/movies/favorites");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div>
      <SectionHeading title="Favorites" icon={<IconHeart size={18} />} />

      {favorites?.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
          {favorites.map((fav: any) => (
            <div key={fav.id} className="text-center">
              <MovieCard
                imageUrl={fav.mediaPosterUrl}
                title={fav.mediaTitle ?? fav.mediaId}
                subtitle={fav.rewatchCount ? `Rewatched ${fav.rewatchCount}×` : undefined}
                onClick={() => router.push(`/movies/media/${fav.mediaId}`)}
              />
              {fav.personalNotes && <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{fav.personalNotes}</Text>}
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">❤️</div>
          <Text size="sm" c="dimmed">No favorites yet. Discover movies and add them to your favorites!</Text>
        </div>
      )}
    </div>
  );
}
