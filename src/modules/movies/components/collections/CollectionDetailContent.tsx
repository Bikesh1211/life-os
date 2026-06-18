"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Container, Text, Button, Title, SimpleGrid, Group, Badge } from "@mantine/core";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

export function CollectionDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  const { data: collection } = useQuery({
    queryKey: ["movie-collection", id],
    queryFn: async () => {
      const res = await fetch(`/api/movies/collections/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  if (!collection) return <Container py="xl"><Text c="dimmed">Loading...</Text></Container>;

  return (
    <Container size="md" py="xl">
      <Button component={Link} href="/movies/collections" variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="lg">
        Back to Collections
      </Button>

      <Title order={2} c="white" mb={4}>{collection.name}</Title>
      {collection.description && <Text size="sm" c="dimmed" mb="md">{collection.description}</Text>}

      {collection.tags?.length > 0 && (
        <Group gap="xs" mb="lg">
          {collection.tags.map((tag: string, i: number) => (
            <Badge key={i} variant="light" size="sm">{tag}</Badge>
          ))}
        </Group>
      )}

      {collection.items?.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
          {collection.items.map((item: any) => (
            <div key={item.id} className="rounded-xl border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-dark-6)] p-3 text-center">
              <div className="mb-2 flex aspect-[2/3] items-center justify-center rounded-lg bg-[var(--mantine-color-dark-5)]">
                <span className="text-4xl text-white/20">🎬</span>
              </div>
              <Text size="xs" c="dimmed" lineClamp={1}>{item.mediaId}</Text>
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <Text size="sm" c="dimmed">No items in this collection yet. Add movies and TV shows from the Discover tab!</Text>
      )}
    </Container>
  );
}
