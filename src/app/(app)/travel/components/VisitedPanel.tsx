"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconPlus, IconWorld, IconMapPin, IconStar, IconMoodSmile } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Modal, TextInput, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

type VisitedPlace = {
  id: string;
  country: string;
  city: string;
  place: string | null;
  visitStart: string | null;
  visitEnd: string | null;
  rating: number | null;
  mood: string | null;
  notes: string | null;
  companions: string[];
  activities: string[];
  isFavorited: boolean;
};

export function VisitedPanel() {
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/travel/visited")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPlaces)
      .finally(() => setLoading(false));
  }, []);

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
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Visited Places</h2>
          <Text size="sm" c="dimmed">{places.length} places explored</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Add Place</Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Add Visited Place" size="md">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          await fetch("/api/travel/visited", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              country: data.country,
              city: data.city,
              place: data.place || undefined,
              ratings: data.rating ? Number(data.rating) : undefined,
            }),
          });
          close();
          window.location.reload();
        }}>
          <Stack gap="sm">
            <TextInput name="country" label="Country" required />
            <TextInput name="city" label="City" required />
            <TextInput name="place" label="Place" />
            <Button type="submit" fullWidth mt="sm">Save</Button>
          </Stack>
        </form>
      </Modal>

      {places.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconWorld size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Places Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Start logging where you have been.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm" lineClamp={1}>{place.place || place.city}</Text>
                  {place.rating && (
                    <Group gap={2}>
                      <IconStar size={14} className="text-[var(--mantine-color-yellow-6)]" />
                      <Text size="sm" fw={600}>{place.rating}</Text>
                    </Group>
                  )}
                </Group>
                <Group gap={4} mb="xs">
                  <IconMapPin size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  <Text size="xs" c="dimmed">{place.city}, {place.country}</Text>
                </Group>
                <Group gap="xs">
                  {place.visitStart && (
                    <Text size="xs" c="dimmed">{dayjs(place.visitStart).format("MMM YYYY")}</Text>
                  )}
                  {place.mood && (
                    <Badge size="sm" variant="light" color="grape">{place.mood}</Badge>
                  )}
                  {place.isFavorited && (
                    <IconMoodSmile size={14} className="text-[var(--mantine-color-yellow-6)]" />
                  )}
                </Group>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
