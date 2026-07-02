"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendarEvent, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { EventsModal } from "./EventsModal";

type Event = {
  id: string;
  title: string;
  eventType: string;
  date: string;
  location: string | null;
  notes: string | null;
  expense: number | null;
  photos: string[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export function EventsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["network-events"],
    queryFn: async () => {
      const res = await fetch("/api/network/events");
      if (!res.ok) throw new Error("Failed to load events");
      return res.json() as Promise<Event[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/network/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Event deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["network-events"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
    },
  });

  const events = data ?? [];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Events</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditData(null); setModalOpen(true); }}>Create Event</Button>
      </Group>

      {events.length === 0 && !isLoading ? (
        <FeaturePlaceholder title="Events" description="Birthday parties, weddings, reunions and more" icon={IconCalendarEvent} />
      ) : (
        <Stack>
          {events.map((e) => (
            <Card key={e.id} withBorder padding="md" radius="md">
              <Group>
                <ThemeIcon variant="light" color="teal" size="lg" radius="xl">
                  <IconCalendarEvent size={20} />
                </ThemeIcon>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text fw={500}>{e.title}</Text>
                  <Group gap="xs">
                    <Badge variant="light" size="sm">{e.eventType}</Badge>
                    <Text size="sm" c="dimmed">{formatDate(e.date)}</Text>
                  </Group>
                </Stack>
                <Stack gap={0} align="flex-end">
                  {e.location && <Text size="sm" c="dimmed">{e.location}</Text>}
                  {e.photos?.length > 0 && <Text size="xs" c="dimmed">{e.photos.length} photos</Text>}
                </Stack>
                <Group gap={4}>
                  <Button size="compact-sm" variant="subtle" onClick={() => { setEditData(e); setModalOpen(true); }}><IconEdit size={14} /></Button>
                  <Button size="compact-sm" variant="subtle" color="red" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(e.id); }}><IconTrash size={14} /></Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <EventsModal opened={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} initialData={editData} />
    </Container>
  );
}
