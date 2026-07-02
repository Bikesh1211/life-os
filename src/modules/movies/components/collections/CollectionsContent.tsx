"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SimpleGrid, Text, Group, Button, Modal, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlaylist, IconPlus, IconTrash, IconExternalLink } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { SectionHeading } from "@/modules/movies/components/design-system/SectionHeading";
import Link from "next/link";

export function CollectionsContent() {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: collections } = useQuery({
    queryKey: ["movie-collections"],
    queryFn: async () => {
      const res = await fetch("/api/movies/collections");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/movies/collections", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      notifications.show({ title: "Created", message: "Collection created", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["movie-collections"] });
      close(); setName(""); setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/movies/collections/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { notifications.show({ title: "Deleted", message: "Collection deleted", color: "orange" }); queryClient.invalidateQueries({ queryKey: ["movie-collections"] }); },
  });

  return (
    <div>
      <SectionHeading
        title="Collections"
        icon={<IconPlaylist size={18} />}
        action={<Button leftSection={<IconPlus size={16} />} size="sm" onClick={open}>New Collection</Button>}
      />

      {collections?.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {collections.map((c: any) => (
            <div key={c.id} className="group relative rounded-xl border border-[var(--mantine-color-dark-4)] bg-[var(--mantine-color-body)] p-4 transition-colors hover:border-[var(--mantine-color-dark-3)]">
              <Link href={`/movies/collections/${c.id}`} className="no-underline">
                <Text fw={600} c="white" size="sm">{c.name}</Text>
                {c.description && <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{c.description}</Text>}
                <Group gap={4} mt="sm">
                  <IconExternalLink size={12} className="text-[var(--mantine-color-dimmed)]" />
                  <Text size="xs" c="dimmed">View collection</Text>
                </Group>
              </Link>
              <button
                onClick={() => deleteMutation.mutate(c.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-[var(--mantine-color-dimmed)] opacity-0 transition-all hover:bg-[var(--mantine-color-dark-4)] hover:text-red-400 group-hover:opacity-100"
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 text-5xl">📂</div>
          <Text size="sm" c="dimmed">No collections yet. Create your first movie collection!</Text>
        </div>
      )}

      <Modal opened={opened} onClose={close} title="New Collection" size="md">
        <div className="space-y-4">
          <TextInput label="Name" placeholder="Christopher Nolan Collection" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <Textarea label="Description" placeholder="My favorite movies by Christopher Nolan" value={description} onChange={(e) => setDescription(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ name, description })} loading={createMutation.isPending} disabled={!name.trim()}>Create</Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
}
