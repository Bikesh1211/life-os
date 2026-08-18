"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { Container, Title, Text, Badge, Group, Button, Card, Avatar, SimpleGrid, Spoiler, Select } from "@mantine/core";
import { IconArrowLeft, IconStar, IconClock, IconMovie, IconHeart, IconListDetails, IconCircleCheck, IconPlaylist } from "@tabler/icons-react";
import Link from "next/link";
import { MemoryCard } from "@/modules/movies/components/memories/MemoryCard";
import { apiFetch } from "@/core/api/http";

export default function MediaDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  const { data, refetch } = useQuery({
    queryKey: ["movie-media", id],
    queryFn: () => apiFetch<any>(`/api/movies/media/${id}`),
    enabled: !!id,
  });

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);

  const toggleFav = async () => {
    if (!data || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      await fetch("/api/movies/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: id }),
      });
      notifications.show({ title: data.isFavorited ? "Removed" : "Added", message: data.isFavorited ? "Removed from favorites" : "Added to favorites", color: data.isFavorited ? "orange" : "green" });
      refetch();
    } finally { setFavoriteLoading(false); }
  };

  const toggleWatchlist = async () => {
    if (!data || watchlistLoading) return;
    setWatchlistLoading(true);
    try {
      if (data.watchlistStatus) {
        const res = await fetch("/api/movies/watchlist");
        const list = await res.json();
        const item = list.find((w: any) => w.mediaId === id);
        if (item) await fetch(`/api/movies/watchlist`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
      } else {
        await fetch("/api/movies/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId: id, status: "plan_to_watch" }),
        });
      }
      notifications.show({ title: data.watchlistStatus ? "Removed" : "Added", message: data.watchlistStatus ? "Removed from watchlist" : "Added to watchlist", color: data.watchlistStatus ? "orange" : "green" });
      refetch();
    } finally { setWatchlistLoading(false); }
  };

  const markAsWatched = async () => {
    if (!data || watchedLoading) return;
    setWatchedLoading(true);
    try {
      if (data.watchlistStatus) {
        const res = await fetch("/api/movies/watchlist");
        const list = await res.json();
        const item = list.find((w: any) => w.mediaId === id);
        if (item) {
          await fetch("/api/movies/watchlist", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id, status: "completed" }),
          });
        }
      } else {
        await fetch("/api/movies/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId: id, status: "completed" }),
        });
      }
      notifications.show({ title: "Watched", message: "Marked as watched", color: "green" });
      refetch();
    } finally { setWatchedLoading(false); }
  };

  const [collectionSelect, setCollectionSelect] = useState<string | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const { data: collections } = useQuery({
    queryKey: ["movie-collections"],
    queryFn: () => apiFetch<any>("/api/movies/collections"),
  });

  const addToCollection = async () => {
    if (!collectionSelect || collectionLoading) return;
    setCollectionLoading(true);
    try {
      await fetch(`/api/movies/collections/${collectionSelect}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: id }),
      });
      notifications.show({ title: "Added", message: "Added to collection", color: "green" });
      setCollectionSelect(null);
    } finally { setCollectionLoading(false); }
  };

  if (!data) return <Container py="xl"><Text c="dimmed">Loading...</Text></Container>;

  return (
    <Container size="lg" py="xl">
      <Button component={Link} href="/movies/discover" variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="lg">
        Back to Discover
      </Button>

      <div className="relative mb-8 overflow-hidden rounded-2xl bg-[var(--mantine-color-dark-7)]" style={{ background: data.backdropUrl ? `linear-gradient(to top, #0a0a0f, transparent), url(${data.backdropUrl}) center/cover no-repeat` : undefined, minHeight: 320 }}>
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-10">
          <div className="w-32 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-40">
            {data.posterUrl ? (
              <img src={data.posterUrl} alt={data.title} className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center bg-[var(--mantine-color-dark-6)]">
                <IconMovie size={64} className="text-white/20" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Title order={1} size="h2" c="white">{data.title}</Title>
            {data.tagline && <Text size="sm" c="dimmed" mt={4} fs="italic">{data.tagline}</Text>}
            <Group gap="xs" mt="sm">
              {data.genres?.map((g: string) => <Badge key={g} variant="light" size="sm">{g}</Badge>)}
            </Group>
            <Group gap="lg" mt="md">
              {data.releaseDate && <Group gap={4}><IconClock size={14} /><Text size="sm" c="dimmed">{new Date(data.releaseDate).getFullYear()}</Text></Group>}
              {data.runtime && <Text size="sm" c="dimmed">{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</Text>}
              {data.voteAverage && <Group gap={4}><IconStar size={14} color="var(--mantine-color-yellow-6)" /><Text size="sm" c="dimmed">{data.voteAverage.toFixed(1)}</Text></Group>}
            </Group>
            <Group gap="xs" mt="md">
              <Button
                size="sm"
                variant={data.isFavorited ? "filled" : "outline"}
                color="red"
                leftSection={<IconHeart size={16} fill={data.isFavorited ? "currentColor" : "none"} />}
                loading={favoriteLoading}
                onClick={toggleFav}
              >
                {data.isFavorited ? "Favorited" : "Favorite"}
              </Button>
              <Button
                size="sm"
                variant={data.watchlistStatus === "completed" ? "filled" : "outline"}
                color="green"
                leftSection={<IconCircleCheck size={16} />}
                loading={watchedLoading}
                onClick={markAsWatched}
                disabled={data.watchlistStatus === "completed"}
              >
                {data.watchlistStatus === "completed" ? "Watched ✓" : "Mark as Watched"}
              </Button>
              <Button
                size="sm"
                variant={data.watchlistStatus && data.watchlistStatus !== "completed" ? "filled" : "outline"}
                color="blue"
                leftSection={<IconListDetails size={16} />}
                loading={watchlistLoading}
                onClick={toggleWatchlist}
              >
                {data.watchlistStatus === "completed" ? "In Watchlist" : data.watchlistStatus ? data.watchlistStatus.replace(/_/g, " ") : "Add to Watchlist"}
              </Button>
            </Group>
            {data.imdbId && (
              <Button component="a" href={`https://www.imdb.com/title/${data.imdbId}`} target="_blank" variant="outline" size="xs" mt="sm">
                View on IMDb
              </Button>
            )}
            {(collections?.length > 0) && (
              <Group gap="xs" mt="sm">
                <Select
                  placeholder="Add to collection"
                  data={collections.map((c: any) => ({ value: c.id, label: c.name }))}
                  value={collectionSelect}
                  onChange={setCollectionSelect}
                  size="xs"
                  clearable
                  searchable
                  style={{ width: 200 }}
                />
                <Button size="xs" variant="light" leftSection={<IconPlaylist size={14} />} loading={collectionLoading} disabled={!collectionSelect} onClick={addToCollection}>
                  Add
                </Button>
              </Group>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {data.overview && (
          <div>
            <Title order={3} size="h4" mb="xs" c="white">Overview</Title>
            <Spoiler maxHeight={80} showLabel="Show more" hideLabel="Show less">
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{data.overview}</Text>
            </Spoiler>
          </div>
        )}

        {data.cast?.length > 0 && (
          <div>
            <Title order={3} size="h4" mb="sm" c="white">Cast</Title>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
              {data.cast.map((c: any) => (
                <Card key={c.id} padding="sm" radius="md" withBorder style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
                  <Avatar src={c.imageUrl} alt={c.name} size="lg" radius="xl" mx="auto">{c.name?.charAt(0)}</Avatar>
                  <Text ta="center" size="sm" fw={500} mt="xs" lineClamp={1}>{c.name}</Text>
                  <Text ta="center" size="xs" c="dimmed" lineClamp={1}>{c.character}</Text>
                </Card>
              ))}
            </SimpleGrid>
          </div>
        )}

        {data.memories?.length > 0 && (
          <div>
            <Group gap="xs" mb="sm">
              <IconHeart size={20} className="text-pink-500" />
              <Title order={3} size="h4" c="white">Your Memories</Title>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {data.memories.map((m: any) => (
                <MemoryCard key={m.id} memory={m} />
              ))}
            </SimpleGrid>
          </div>
        )}
      </div>
    </Container>
  );
}
