"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { Container, Text, Button, Title, SimpleGrid, Group, Badge, TextInput, Loader, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconTrash, IconPlus, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { TMDB_IMAGE_BASE_URL } from "@/modules/movies/tmdb";

export function CollectionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        setSearchResults((json.media ?? []).slice(0, 5));
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [searchQuery]);

  const { data: collection, refetch } = useQuery({
    queryKey: ["movie-collection", id],
    queryFn: async () => {
      const res = await fetch(`/api/movies/collections/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`/api/movies/collections/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { notifications.show({ title: "Added", message: "Movie added to collection", color: "green" }); refetch(); queryClient.invalidateQueries({ queryKey: ["movie-collections"] }); setSearchQuery(""); setSearchResults([]); },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/movies/collections/${id}/items?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { notifications.show({ title: "Removed", message: "Removed from collection", color: "orange" }); refetch(); queryClient.invalidateQueries({ queryKey: ["movie-collections"] }); },
  });

  const deleteCollection = async () => {
    if (!confirm("Delete this entire collection?")) return;
    await fetch(`/api/movies/collections/${id}`, { method: "DELETE" });
    notifications.show({ title: "Deleted", message: "Collection deleted", color: "orange" });
    queryClient.invalidateQueries({ queryKey: ["movie-collections"] });
    router.push("/movies/collections");
  };

  if (!collection) return <Container py="xl"><Text c="dimmed">Loading...</Text></Container>;

  const existingMediaIds = new Set((collection.items ?? []).map((i: any) => i.mediaId));

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Button component={Link} href="/movies/collections" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Collections
        </Button>
        <Button size="sm" variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={deleteCollection}>Delete Collection</Button>
      </Group>

      <Title order={2} c="white" mb={4}>{collection.name}</Title>
      {collection.description && <Text size="sm" c="dimmed" mb="md">{collection.description}</Text>}

      {collection.tags?.length > 0 && (
        <Group gap="xs" mb="lg">
          {collection.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="light" size="sm">{tag}</Badge>
          ))}
        </Group>
      )}

      <div className="mb-8">
        <Text size="sm" fw={500} c="white" mb={4}>Add Movies</Text>
        <TextInput
          placeholder="Search movies and TV shows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          rightSection={searching ? <Loader size="xs" /> : null}
        />
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-60 space-y-1 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--mantine-color-dark-6)] p-1">
            {searchResults.map((r: any) => {
              const compId = `${r.mediaType}-${r.tmdbId}`;
              const alreadyAdded = existingMediaIds.has(compId);
              return (
                <div key={compId} className="flex items-center gap-3 rounded-md px-3 py-2">
                  {r.posterPath ? (
                    <img src={`${TMDB_IMAGE_BASE_URL}/w92${r.posterPath}`} alt="" className="h-10 w-7 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-7 items-center justify-center rounded bg-[var(--mantine-color-dark-4)] text-xs">🎬</div>
                  )}
                  <div className="flex-1 truncate">
                    <Text size="sm" c="white" lineClamp={1}>{r.title}</Text>
                    <Text size="xs" c="dimmed">{r.mediaType === "movie" ? "Movie" : "TV"}</Text>
                  </div>
                  <Button
                    size="compact-xs"
                    variant={alreadyAdded ? "light" : "filled"}
                    color={alreadyAdded ? "gray" : "blue"}
                    leftSection={alreadyAdded ? null : <IconPlus size={12} />}
                    disabled={alreadyAdded || addMutation.isPending}
                    onClick={() => !alreadyAdded && addMutation.mutate(compId)}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {collection.items?.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
          {collection.items.map((item: any) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] transition-all hover:shadow-md">
              <Link href={`/movies/media/${item.mediaId}`} className="no-underline">
                {item.mediaPosterUrl ? (
                  <img src={item.mediaPosterUrl} alt="" className="aspect-[2/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-[var(--mantine-color-dark-5)]">
                    <span className="text-4xl text-white/20">🎬</span>
                  </div>
                )}
              </Link>
              <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip label="Remove from collection">
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm hover:bg-red-600/80"
                  >
                    <IconX size={14} />
                  </button>
                </Tooltip>
              </div>
              <div className="p-2">
                <Link href={`/movies/media/${item.mediaId}`} className="no-underline">
                  <Text size="xs" c="white" lineClamp={1}>{item.mediaTitle ?? item.mediaId}</Text>
                </Link>
              </div>
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <Text size="sm" c="dimmed">No items in this collection yet. Search above to add movies.</Text>
      )}
    </Container>
  );
}
