"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconPlus, IconBackpack, IconClock, IconWorld } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Checkbox, Modal, Select, TextInput, Stack } from "@mantine/core";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  ExploreFieldset,
  optionalNumber,
} from "./ExploreFields";
import { useDisclosure } from "@mantine/hooks";
import { apiFetch } from "@/core/api/http";
import dayjs from "dayjs";

type Trip = {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: "planning" | "booked" | "in_progress" | "completed" | "cancelled";
  budget: number | null;
  currency: string;
  travelers: number;
  notes: string | null;
  createdAt: string;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  planning: { color: "blue", label: "Planning" },
  booked: { color: "indigo", label: "Booked" },
  in_progress: { color: "green", label: "In Progress" },
  completed: { color: "teal", label: "Completed" },
  cancelled: { color: "gray", label: "Cancelled" },
};

function CreateTripModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState("");
  const [elevationM, setElevationM] = useState("");
  const [transportation, setTransportation] = useState("");
  const [featured, setFeatured] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !destination.trim()) return;
    await apiFetch("/api/travel/trips", {
      method: "POST",
      body: JSON.stringify({
        title,
        destination,
        country: country || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        coverImage: coverImage.trim() || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        distanceKm: optionalNumber(distanceKm),
        elevationM: optionalNumber(elevationM),
        transportation: transportation.trim() || undefined,
        featured: featured || undefined,
      }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Plan a Trip" size="md">
      <Stack gap="sm">
        <TextInput label="Title" placeholder="Summer in Europe" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
        <TextInput label="Destination" placeholder="Paris, France" value={destination} onChange={(e) => setDestination(e.currentTarget.value)} required />
        <TextInput label="Country" placeholder="France" value={country} onChange={(e) => setCountry(e.currentTarget.value)} />
        <Group grow>
          <TextInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} />
          <TextInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
        </Group>

        <ExploreFieldset hint="Optional. These are what the Adventure Archive draws its dossier from — a trip without them still appears, it simply prints fewer figures.">
          <TextInput
            label="Cover image URL"
            placeholder="https://…"
            value={coverImage}
            onChange={(e) => setCoverImage(e.currentTarget.value)}
          />
          <Group grow>
            <Select label="Kind" data={CATEGORY_OPTIONS} value={category} onChange={setCategory} clearable />
            <Select label="Difficulty" data={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} clearable />
          </Group>
          <Group grow>
            <TextInput label="Distance (km)" type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.currentTarget.value)} />
            <TextInput label="Peak elevation (m)" type="number" value={elevationM} onChange={(e) => setElevationM(e.currentTarget.value)} />
          </Group>
          <TextInput
            label="Transport"
            placeholder="Motorcycle, train, on foot…"
            value={transportation}
            onChange={(e) => setTransportation(e.currentTarget.value)}
          />
          <Checkbox
            label="Feature this expedition on the archive's front page"
            checked={featured}
            onChange={(e) => setFeatured(e.currentTarget.checked)}
          />
        </ExploreFieldset>

        <Button fullWidth onClick={handleSubmit} mt="sm">Create Trip</Button>
      </Stack>
    </Modal>
  );
}

export function TripsPanel() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    apiFetch<Trip[]>("/api/travel/trips")
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Trips</h2>
          <Text size="sm" c="dimmed">{trips.length} trips planned</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>New Trip</Button>
      </Group>

      <CreateTripModal opened={opened} onClose={close} />

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconBackpack size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Trips Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Plan your first adventure.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                onClick={() => router.push(`/travel/trips/${trip.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm" lineClamp={1}>{trip.title}</Text>
                  <Badge color={statusConfig[trip.status]?.color ?? "gray"} size="sm" variant="light">
                    {statusConfig[trip.status]?.label ?? trip.status}
                  </Badge>
                </Group>
                <Group gap={4} mb="sm">
                  <IconWorld size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                  <Text size="xs" c="dimmed">{trip.destination}</Text>
                </Group>
                <Group gap="xs">
                  {trip.startDate && (
                    <Group gap={4}>
                      <IconClock size={12} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                      <Text size="xs" c="dimmed">{dayjs(trip.startDate).format("MMM D")}</Text>
                    </Group>
                  )}
                  {trip.endDate && (
                    <Text size="xs" c="dimmed">– {dayjs(trip.endDate).format("MMM D, YYYY")}</Text>
                  )}
                </Group>
                {trip.budget && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Budget: {trip.currency} ${(trip.budget / 100).toLocaleString()}
                  </Text>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
