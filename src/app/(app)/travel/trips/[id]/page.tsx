"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconArrowLeft, IconTrash, IconEdit, IconWorld, IconCalendar, IconUsers, IconCoin } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, ActionIcon, Stack, Loader, Center, Modal, TextInput, Textarea, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

type Trip = {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  budget: number | null;
  currency: string;
  travelers: number;
  notes: string | null;
};

function EditTripModal({ trip, opened, onClose }: { trip: Trip; opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [country, setCountry] = useState(trip.country ?? "");
  const [status, setStatus] = useState<string | null>(trip.status);
  const [startDate, setStartDate] = useState(trip.startDate ? dayjs(trip.startDate).format("YYYY-MM-DD") : "");
  const [endDate, setEndDate] = useState(trip.endDate ? dayjs(trip.endDate).format("YYYY-MM-DD") : "");
  const [budget, setBudget] = useState(trip.budget ? String(trip.budget / 100) : "");
  const [travelers, setTravelers] = useState(String(trip.travelers));
  const [currency, setCurrency] = useState(trip.currency);
  const [notes, setNotes] = useState(trip.notes ?? "");

  async function handleSubmit() {
    if (!title.trim() || !destination.trim()) return;
    await fetch(`/api/travel/trips/${trip.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        destination,
        country: country || undefined,
        status: status || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        budget: budget ? Math.round(Number(budget) * 100) : null,
        travelers: travelers ? Number(travelers) : 1,
        currency: currency || undefined,
        notes: notes || undefined,
      }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Trip" size="md">
      <Stack gap="sm">
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
        <TextInput label="Destination" value={destination} onChange={(e) => setDestination(e.currentTarget.value)} required />
        <TextInput label="Country" value={country} onChange={(e) => setCountry(e.currentTarget.value)} />
        <Select label="Status" data={[
          { value: "planning", label: "Planning" },
          { value: "booked", label: "Booked" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]} value={status} onChange={setStatus} />
        <Group grow>
          <TextInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)} />
          <TextInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)} />
        </Group>
        <Group grow>
          <TextInput label="Total Budget ($)" type="number" value={budget} onChange={(e) => setBudget(e.currentTarget.value)} />
          <TextInput label="Travelers" type="number" min={1} value={travelers} onChange={(e) => setTravelers(e.currentTarget.value)} />
        </Group>
        <TextInput label="Currency" value={currency} onChange={(e) => setCurrency(e.currentTarget.value)} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
        <Button fullWidth onClick={handleSubmit} mt="sm">Save Changes</Button>
      </Stack>
    </Modal>
  );
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/travel/trips/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <Center py="xl"><Loader /></Center>;
  }

  if (!trip) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 text-center">
        <Text c="dimmed">Trip not found</Text>
        <Button variant="light" onClick={() => router.push("/travel/trips")} mt="md">Back to Trips</Button>
      </div>
    );
  }

  async function handleDelete() {
    if (!trip) return;
    await fetch(`/api/travel/trips/${trip.id}`, { method: "DELETE" });
    notifications.show({ title: "Deleted", message: "Trip deleted", color: "orange" });
    router.push("/travel/trips");
  }

  const statusColors: Record<string, string> = {
    planning: "blue", booked: "indigo", in_progress: "green", completed: "teal", cancelled: "gray",
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Group mb="lg">
        <ActionIcon variant="subtle" onClick={() => router.push("/travel/trips")}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <div style={{ flex: 1 }}>
          <Group justify="space-between">
            <div>
              <Group gap="sm" mb={4}>
                <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">{trip.title}</h2>
                <Badge color={statusColors[trip.status] ?? "gray"} size="sm" variant="light">
                  {trip.status.replace("_", " ")}
                </Badge>
              </Group>
              <Group gap={4}>
                <IconWorld size={14} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
                <Text size="sm" c="dimmed">{trip.destination}</Text>
              </Group>
            </div>
            <Group>
              <Button variant="light" size="sm" leftSection={<IconEdit size={16} />} onClick={openEdit}>Edit</Button>
              <Button color="red" variant="light" size="sm" leftSection={<IconTrash size={16} />} onClick={handleDelete}>Delete</Button>
            </Group>
          </Group>
        </div>
      </Group>

      <div className="grid gap-4 sm:grid-cols-3">
        {trip.startDate && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <IconCalendar size={16} className="text-[var(--mantine-color-blue-6)]" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Dates</Text>
            </Group>
            <Text size="sm" fw={600}>
              {dayjs(trip.startDate).format("MMM D")} – {trip.endDate ? dayjs(trip.endDate).format("MMM D, YYYY") : "TBD"}
            </Text>
          </Card>
        )}
        {trip.budget && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <IconCoin size={16} className="text-[var(--mantine-color-green-6)]" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Budget</Text>
            </Group>
            <Text size="sm" fw={600}>{trip.currency} ${(trip.budget / 100).toLocaleString()}</Text>
            <Text size="xs" c="dimmed">
              ${((trip.budget / 100) / (trip.travelers || 1)).toLocaleString()} per person
            </Text>
          </Card>
        )}
        {trip.travelers > 0 && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <IconUsers size={16} className="text-[var(--mantine-color-violet-6)]" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Travelers</Text>
            </Group>
            <Text size="sm" fw={600}>{trip.travelers}</Text>
          </Card>
        )}
      </div>

      {trip.notes && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Text fw={600} size="sm" mb="xs">Notes</Text>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{trip.notes}</Text>
        </Card>
      )}

      {trip.country && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Text fw={600} size="sm" mb="xs">Country</Text>
          <Text size="sm">{trip.country}</Text>
        </Card>
      )}

      <EditTripModal trip={trip} opened={editOpened} onClose={closeEdit} />
    </div>
  );
}
