"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Container, Text, Group, Button, Title, SimpleGrid, Badge } from "@mantine/core";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { MemoryCreateModal } from "./MemoryCreateModal";

export function MemoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const [editOpened, setEditOpened] = useState(false);

  const { data: memory, refetch } = useQuery({
    queryKey: ["movie-memory", id],
    queryFn: async () => {
      const res = await fetch(`/api/movies/memories/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/movies/memories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-memories"] });
      router.push("/movies/memories");
    },
  });

  if (!memory) {
    return (
      <Container py="xl">
        <Text c="dimmed">Loading...</Text>
      </Container>
    );
  }

  const moodLabels: Record<string, string> = {
    amazing: "😁 Amazing", loved_it: "😍 Loved It", emotional: "🥹 Emotional",
    mind_blowing: "🤯 Mind Blowing", funny: "😂 Funny", scary: "😱 Scary",
    boring: "😴 Boring", personal_story: "✍️ Personal Story",
  };

  return (
    <Container size="md" py="xl">
      <MemoryCreateModal opened={editOpened} onClose={() => setEditOpened(false)} onSuccess={() => { refetch(); queryClient.invalidateQueries({ queryKey: ["movie-memories"] }); }} memory={memory} />

      <Group justify="space-between" mb="lg">
        <Button component={Link} href="/movies/memories" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Memories
        </Button>
        <Group gap="xs">
          <Button size="sm" variant="light" color="yellow" leftSection={<IconEdit size={14} />} onClick={() => setEditOpened(true)}>Edit</Button>
          <Button size="sm" variant="light" color="red" leftSection={<IconTrash size={14} />} loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this memory?")) deleteMutation.mutate(); }}>Delete</Button>
        </Group>
      </Group>

      <Title order={2} c="white" mb={4}>{memory.title ?? "Untitled Memory"}</Title>
      {memory.mood && <Text size="lg" mb="md">{moodLabels[memory.mood] ?? memory.mood}</Text>}

      <div className="mb-6 space-y-4">
        {(memory.photoUrls?.length > 0 || memory.screenshotUrls?.length > 0 || memory.ticketUrls?.length > 0) && (
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
            {[...(memory.photoUrls ?? []), ...(memory.screenshotUrls ?? []), ...(memory.ticketUrls ?? [])].map((url: string, i: number) => (
              <div key={i} className="aspect-video overflow-hidden rounded-lg">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </SimpleGrid>
        )}

        <Text size="sm" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }} c="dimmed">
          {memory.contextText}
        </Text>

        <Group gap="xs">
          {memory.mediaId && memory.mediaTitle && (
            <Badge
              component={Link}
              href={`/movies/media/${memory.mediaId}`}
              variant="light"
              color="blue"
              style={{ cursor: "pointer" }}
              rightSection={memory.mediaPosterUrl ? <img src={memory.mediaPosterUrl} alt="" className="h-4 w-4 rounded object-cover" /> : undefined}
            >
              {memory.mediaTitle}
            </Badge>
          )}
          {memory.watchDate && <Badge variant="light">📅 {new Date(memory.watchDate).toLocaleDateString()}</Badge>}
          {memory.location && <Badge variant="light">📍 {memory.location}</Badge>}
          {memory.watchedWith && <Badge variant="light">👤 {memory.watchedWith}</Badge>}
        </Group>
      </div>
    </Container>
  );
}
