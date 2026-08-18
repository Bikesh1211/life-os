"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCoffee, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { MeetupsModal } from "./MeetupsModal";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  mood: string | null;
  notes: string | null;
  expense: number | null;
  photos: string[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function MeetupsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Meetup | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["network-meetups"],
    queryFn: () => apiFetch<Meetup[]>("/api/network/meetups"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/network/meetups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Meetup deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["network-meetups"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
    },
  });

  const meetups = data ?? [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Meetups</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditData(null); setModalOpen(true); }}>Log Meetup</Button>
      </Group>

      {meetups.length === 0 && !isLoading ? (
        <FeaturePlaceholder title="Meetups" description="Log your gatherings with friends" icon={IconCoffee} />
      ) : (
        <Stack>
          {meetups.map((m) => (
            <Card key={m.id} withBorder padding="md" radius="md">
              <Group>
                <ThemeIcon variant="light" color="orange" size="lg" radius="xl">
                  <IconCoffee size={20} />
                </ThemeIcon>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text fw={500}>{m.title}</Text>
                  <Text size="sm" c="dimmed">{formatDate(m.date)}{m.location ? ` · ${m.location}` : ""}</Text>
                </Stack>
                <Stack gap={0} align="flex-end">
                  {m.mood && <Text size="sm">{m.mood}</Text>}
                  {m.photos?.length > 0 && <Text size="xs" c="dimmed">{m.photos.length} photos</Text>}
                </Stack>
                <Group gap={4}>
                  <Button size="compact-sm" variant="subtle" onClick={() => { setEditData(m); setModalOpen(true); }}><IconEdit size={14} /></Button>
                  <Button size="compact-sm" variant="subtle" color="red" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this meetup?")) deleteMutation.mutate(m.id); }}><IconTrash size={14} /></Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <MeetupsModal opened={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} initialData={editData} />
    </Container>
  );
}
