"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TextInput, SimpleGrid, Text, Group, Badge, Skeleton, Button } from "@mantine/core";
import { IconSearch, IconTrendingUp, IconStar, IconFlame } from "@tabler/icons-react";
import Link from "next/link";
import { MovieCard } from "@/modules/movies/components/design-system/MovieCard";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";

export function DiscoverContent() {
  const [query, setQuery] = useState("");

  const { data: explore, isLoading } = useQuery({
    queryKey: ["movies-explore"],
    queryFn: async () => {
      const res = await fetch("/api/movies/explore");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["movies-search", query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}&type=all`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: query.trim().length > 0,
  });

  const sections = [
    { title: "Trending This Week", icon: <IconFlame size={18} />, items: explore?.trending ?? [] },
    { title: "Popular", icon: <IconTrendingUp size={18} />, items: explore?.popular ?? [] },
    { title: "Top Rated", icon: <IconStar size={18} />, items: explore?.topRated ?? [] },
  ];

  return (
    <div>
      <TextInput
        placeholder="Search movies, TV shows..."
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        size="lg"
        mb="xl"
      />

      {searchResults?.media?.length > 0 && (
        <div className="mb-8">
          <SectionHeading title="Search Results" />
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
            {searchResults.media.slice(0, 10).map((m: any) => (
              <Link key={m.tmdbId ?? m.id} href={`/movies/media/${m.mediaType ?? "movie"}-${m.tmdbId ?? m.id}`} className="no-underline">
                <MovieCard
                  imageUrl={m.posterPath ? `https://image.tmdb.org/t/p/w342${m.posterPath}` : null}
                  title={m.title}
                  subtitle={m.mediaType === "movie" ? "Movie" : "TV"}
                />
              </Link>
            ))}
          </SimpleGrid>
        </div>
      )}

      {!query.trim() && (
        <div className="space-y-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton h={24} w={200} mb="sm" />
                <div className="flex gap-3">
                  {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} w={160} h={240} radius="md" />)}
                </div>
              </div>
            ))
          ) : (
            sections.map((section) => (
              <div key={section.title}>
                <SectionHeading title={section.title} icon={section.icon} />
                {section.items.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {section.items.map((item: any) => (
                      <Link key={item.id} href={`/movies/media/${item.id}`} className="shrink-0 no-underline">
                        <MovieCard imageUrl={item.imageUrl} title={item.title} subtitle={item.subtitle} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Text size="sm" c="dimmed">No results</Text>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
