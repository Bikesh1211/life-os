"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconToolsKitchen2, IconStar, IconTrash } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Modal, TextInput, Select, Stack, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

type Restaurant = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  cuisine: string | null;
  rating: number | null;
  priceRange: number | null;
  notes: string | null;
  bestDish: string | null;
  isFavorited: boolean;
};

const cuisineConfig: Record<string, { color: string; label: string }> = {
  italian: { color: "red", label: "Italian" },
  japanese: { color: "red", label: "Japanese" },
  chinese: { color: "red", label: "Chinese" },
  indian: { color: "orange", label: "Indian" },
  mexican: { color: "green", label: "Mexican" },
  thai: { color: "orange", label: "Thai" },
  french: { color: "indigo", label: "French" },
  american: { color: "blue", label: "American" },
  mediterranean: { color: "teal", label: "Mediterranean" },
  korean: { color: "red", label: "Korean" },
  vietnamese: { color: "green", label: "Vietnamese" },
  middle_eastern: { color: "yellow", label: "Middle Eastern" },
  spanish: { color: "red", label: "Spanish" },
  other: { color: "gray", label: "Other" },
};

export function RestaurantsPanel() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/restaurants")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRestaurants)
      .finally(() => setLoading(false));
  }, []);

  async function deleteRestaurant(id: string) {
    await fetch(`/api/travel/restaurants/${id}`, { method: "DELETE" });
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <>
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Restaurants</h2>
          <Text size="sm" c="dimmed">{restaurants.length} food memories</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Add Restaurant</Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Add Restaurant" size="md">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          await fetch("/api/travel/restaurants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              country: data.country || undefined,
              city: data.city || undefined,
              cuisine: data.cuisine || undefined,
              rating: data.rating ? Number(data.rating) : undefined,
            }),
          });
          close();
          window.location.reload();
        }}>
          <Stack gap="sm">
            <TextInput name="name" label="Restaurant Name" required />
            <TextInput name="city" label="City" />
            <TextInput name="country" label="Country" />
            <Select name="cuisine" label="Cuisine" data={Object.entries(cuisineConfig).map(([k, v]) => ({ value: k, label: v.label }))} clearable />
            <Select name="rating" label="Rating (1-10)" data={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} clearable />
            <Button type="submit" fullWidth mt="sm">Save</Button>
          </Stack>
        </form>
      </Modal>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconToolsKitchen2 size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Restaurants Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Log the places you have eaten.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm" lineClamp={1}>{r.name}</Text>
                  <Group gap={4}>
                    {r.rating && (
                      <>
                        <IconStar size={14} className="text-[var(--mantine-color-yellow-6)]" />
                        <Text size="sm" fw={600}>{r.rating}/10</Text>
                      </>
                    )}
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteRestaurant(r.id)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
                {r.cuisine && (
                  <Badge size="sm" variant="light" color={cuisineConfig[r.cuisine]?.color ?? "gray"} mb="xs">
                    {cuisineConfig[r.cuisine]?.label ?? r.cuisine}
                  </Badge>
                )}
                {(r.city || r.country) && (
                  <Text size="xs" c="dimmed">{r.city}{r.city && r.country ? ", " : ""}{r.country}</Text>
                )}
                {r.bestDish && (
                  <Text size="xs" c="dimmed" mt={4}>Best dish: {r.bestDish}</Text>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
