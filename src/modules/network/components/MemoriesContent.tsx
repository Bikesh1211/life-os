"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge, SimpleGrid, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPhotoHeart, IconHeart, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { MemoriesModal } from "./MemoriesModal";

type Memory = {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  location: string | null;
  tags: string[];
  isFavorite: boolean;
  photoUrls: string[];
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function MemoriesContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Memory | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["network-memories"],
    queryFn: () => apiFetch<Memory[]>("/api/network/memories"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/network/memories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Memory deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["network-memories"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
    },
  });

  const memories = data ?? [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Memories</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditData(null); setModalOpen(true); }}>Create Memory</Button>
      </Group>

      {memories.length === 0 && !isLoading ? (
        <FeaturePlaceholder title="Memories" description="Capture memories with the people who matter" icon={IconPhotoHeart} />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {memories.map((m) => (
            <Card key={m.id} withBorder padding="md" radius="md">
              <Stack>
                <Group>
                  <ThemeIcon variant="light" color="violet" size="lg" radius="xl">
                    <IconPhotoHeart size={20} />
                  </ThemeIcon>
                  <Text fw={500} style={{ flex: 1 }}>{m.title}</Text>
                  {m.isFavorite && <IconHeart size={16} color="red" />}
                  <Group gap={4}>
                    <Button size="compact-sm" variant="subtle" onClick={() => { setEditData(m); setModalOpen(true); }}><IconEdit size={14} /></Button>
                    <Button size="compact-sm" variant="subtle" color="red" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this memory?")) deleteMutation.mutate(m.id); }}><IconTrash size={14} /></Button>
                  </Group>
                </Group>
                {m.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>{m.description}</Text>
                )}
                <Group gap="xs">
                  {formatDate(m.memoryDate) && (
                    <Text size="xs" c="dimmed">{formatDate(m.memoryDate)}</Text>
                  )}
                  {m.photoUrls?.length > 0 && (
                    <Badge variant="light" size="sm">{m.photoUrls.length} photos</Badge>
                  )}
                  {m.location && <Badge variant="light" size="sm">{m.location}</Badge>}
                </Group>
                {m.tags?.length > 0 && (
                  <Group gap="xs">
                    {m.tags.map((t) => <Badge key={t} variant="dot" size="sm">{t}</Badge>)}
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <MemoriesModal opened={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} initialData={editData} />
    </Container>
  );
}
