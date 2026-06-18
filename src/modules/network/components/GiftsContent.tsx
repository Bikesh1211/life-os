"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge, Button } from "@mantine/core";
import { IconGift, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { GiftsModal } from "./GiftsModal";

type Gift = {
  id: string;
  giftName: string;
  direction: "given" | "received";
  connectionId: string;
  occasion: string | null;
  price: number | null;
  date: string;
  notes: string | null;
};

export function GiftsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Gift | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["network-gifts"],
    queryFn: async () => {
      const res = await fetch("/api/network/gifts");
      if (!res.ok) throw new Error("Failed to load gifts");
      return res.json() as Promise<Gift[]>;
    },
  });

  const { data: allConnections } = useQuery({
    queryKey: ["network-connections"],
    queryFn: async () => {
      const res = await fetch("/api/network/connections");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ id: string; name: string }[]>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/network/gifts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-gifts"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
    },
  });

  const gifts = data ?? [];
  const connMap = new Map((allConnections ?? []).map((c) => [c.id, c.name]));

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Gifts</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { setEditData(null); setModalOpen(true); }}>Track Gift</Button>
      </Group>

      {gifts.length === 0 && !isLoading ? (
        <FeaturePlaceholder title="Gifts" description="Track gifts you've given and received" icon={IconGift} />
      ) : (
        <Stack>
          {gifts.map((g) => (
            <Card key={g.id} withBorder padding="md" radius="md">
              <Group>
                <ThemeIcon variant="light" color={g.direction === "given" ? "red" : "teal"} size="lg" radius="xl">
                  <IconGift size={20} />
                </ThemeIcon>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Text fw={500}>{g.giftName}</Text>
                  <Text size="sm" c="dimmed">
                    {g.direction === "given" ? "To" : "From"}: {connMap.get(g.connectionId) ?? "Unknown"}
                    {g.occasion ? ` · ${g.occasion}` : ""}
                  </Text>
                </Stack>
                <Stack gap={0} align="flex-end">
                  <Badge variant="light" color={g.direction === "given" ? "red" : "teal"} size="sm">
                    {g.direction}
                  </Badge>
                  {g.price != null && g.direction === "given" && (
                    <Text size="sm" fw={500}>Rs. {g.price}</Text>
                  )}
                </Stack>
                <Group gap={4}>
                  <Button size="compact-sm" variant="subtle" onClick={() => { setEditData(g); setModalOpen(true); }}><IconEdit size={14} /></Button>
                  <Button size="compact-sm" variant="subtle" color="red" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this gift?")) deleteMutation.mutate(g.id); }}><IconTrash size={14} /></Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <GiftsModal opened={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} initialData={editData} />
    </Container>
  );
}
