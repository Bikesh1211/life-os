"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconStar, IconWorld, IconMapPin, IconFlag } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Modal, TextInput, Textarea, Select, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type WishlistItem = {
  id: string;
  title: string;
  country: string | null;
  city: string | null;
  description: string | null;
  priority: "low" | "medium" | "high" | "dream";
  category: string | null;
  estimatedBudget: number | null;
  bestSeason: string | null;
  isVisited: boolean;
  tags: string[];
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "gray", label: "Low" },
  medium: { color: "blue", label: "Medium" },
  high: { color: "orange", label: "High" },
  dream: { color: "violet", label: "Dream" },
};

function CreateWishlistModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [priority, setPriority] = useState<string | null>("medium");

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch("/api/travel/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, country: country || undefined, priority: priority || undefined }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add to Wishlist" size="md">
      <Stack gap="sm">
        <TextInput label="Destination" placeholder="Santorini, Greece" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
        <TextInput label="Country" placeholder="Greece" value={country} onChange={(e) => setCountry(e.currentTarget.value)} />
        <Select label="Priority" data={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "dream", label: "Dream" },
        ]} value={priority} onChange={setPriority} />
        <Button fullWidth onClick={handleSubmit} mt="sm">Add to Wishlist</Button>
      </Stack>
    </Modal>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/wishlist")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function markVisited(id: string) {
    await fetch(`/api/travel/wishlist/${id}/visited`, { method: "POST" });
    window.location.reload();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/travel/wishlist/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  const unvisited = items.filter((i) => !i.isVisited);
  const visited = items.filter((i) => i.isVisited);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Wishlist</h2>
          <Text size="sm" c="dimmed">{unvisited.length} dreaming · {visited.length} visited</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Add Destination</Button>
      </Group>

      <CreateWishlistModal opened={opened} onClose={close} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconStar size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">Your Wishlist is Empty</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Where do you want to go?</p>
        </div>
      ) : (
        <>
          {unvisited.length > 0 && (
            <>
              <Text fw={600} size="sm" mb="sm">
                <Group gap={4}>
                  <IconFlag size={16} />
                  <span>Dream Destinations</span>
                </Group>
              </Text>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unvisited.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card shadow="sm" padding="md" radius="md" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={600} size="sm" lineClamp={1}>{item.title}</Text>
                        <Badge color={priorityConfig[item.priority]?.color ?? "gray"} size="sm" variant="light">
                          {priorityConfig[item.priority]?.label ?? item.priority}
                        </Badge>
                      </Group>
                      {item.country && (
                        <Group gap={4} mb="xs">
                          <IconWorld size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                          <Text size="xs" c="dimmed">{item.country}</Text>
                        </Group>
                      )}
                      <Group gap="xs" mt="sm">
                        <Button size="xs" variant="light" color="teal" onClick={() => markVisited(item.id)}>
                          Mark Visited
                        </Button>
                        <Button size="xs" variant="subtle" color="red" onClick={() => deleteItem(item.id)}>
                          Remove
                        </Button>
                      </Group>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {visited.length > 0 && (
            <>
              <Text fw={600} size="sm" mb="sm" c="dimmed">Visited</Text>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visited.map((item) => (
                  <Card key={item.id} shadow="sm" padding="md" radius="md" withBorder opacity={0.7}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={600} size="sm" lineClamp={1} td="line-through">{item.title}</Text>
                      <Badge color="teal" size="sm" variant="light">Visited</Badge>
                    </Group>
                    {item.country && (
                      <Group gap={4}>
                        <IconWorld size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                        <Text size="xs" c="dimmed">{item.country}</Text>
                      </Group>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
