"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, Badge, ThemeIcon, SimpleGrid, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUserPlus, IconHeart, IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { ConnectionsModal } from "./ConnectionsModal";

type Connection = {
  id: string;
  name: string;
  nickname: string | null;
  gender: string | null;
  birthday: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  occupation: string | null;
  socialLinks: string[];
  relationshipTypes: string[];
  isFavorite: boolean;
  notes: string | null;
  firstMetDate: string | null;
  friendshipAnniversary: string | null;
  lastMetDate: string | null;
  lastCallDate: string | null;
  lastMessageDate: string | null;
};

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function ConnectionsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Connection | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["network-connections"],
    queryFn: async () => {
      const res = await fetch("/api/network/connections");
      if (!res.ok) throw new Error("Failed to load connections");
      return res.json() as Promise<Connection[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/network/connections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      notifications.show({ title: "Deleted", message: "Connection deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["network-connections"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
    },
  });

  const connections = data ?? [];

  function openEdit(conn: Connection) {
    setEditData(conn);
    setModalOpen(true);
  }

  function openCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Connections ({connections.length})</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Add Connection</Button>
      </Group>

      {connections.length === 0 && !isLoading ? (
        <FeaturePlaceholder title="Connections" description="People you know will appear here" icon={IconUserPlus} />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {connections.map((c) => (
            <Card key={c.id} withBorder padding="md" radius="md">
              <Stack>
                <Group>
                  <ThemeIcon variant="light" color={c.isFavorite ? "yellow" : "blue"} size="lg" radius="xl">
                    {c.isFavorite ? <IconHeart size={20} /> : <IconUserPlus size={20} />}
                  </ThemeIcon>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={500}>{c.name}</Text>
                    {c.nickname && <Text size="sm" c="dimmed">{c.nickname}</Text>}
                  </Stack>
                  <Group gap={4}>
                    <Button size="compact-sm" variant="subtle" onClick={() => openEdit(c)}><IconEdit size={14} /></Button>
                    <Button size="compact-sm" variant="subtle" color="red" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this connection?")) deleteMutation.mutate(c.id); }}><IconTrash size={14} /></Button>
                  </Group>
                </Group>
                <Group gap="xs">
                  {c.relationshipTypes?.map((t) => (
                    <Badge key={t} variant="light" size="sm">{t}</Badge>
                  ))}
                </Group>
                <Stack gap="xs">
                  {c.birthday && <Text size="sm" c="dimmed">Birthday: {c.birthday}</Text>}
                  {c.lastMetDate && (
                    <Text size="sm" c="dimmed">Last met: {daysSince(c.lastMetDate)} days ago</Text>
                  )}
                  {c.city && <Text size="sm" c="dimmed">{c.city}{c.country ? `, ${c.country}` : ""}</Text>}
                </Stack>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <ConnectionsModal opened={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} initialData={editData} />
    </Container>
  );
}
