"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Stack, SimpleGrid, MultiSelect } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "@/core/api/http";

type EventData = {
  id: string;
  title: string;
  eventType: string;
  date: string;
  location: string | null;
  notes: string | null;
  expense: number | null;
  photos: string[];
};

type Props = {
  opened: boolean;
  onClose: () => void;
  initialData?: EventData | null;
};

export function EventsModal({ opened, onClose, initialData }: Props) {
  const isEditing = !!initialData;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [expense, setExpense] = useState("");
  const [connectionIds, setConnectionIds] = useState<string[]>([]);

  const { data: allConnections } = useQuery({
    queryKey: ["network-connections"],
    queryFn: () => apiFetch<{ id: string; name: string }[]>("/api/network/connections"),
  });

  const connOptions = (allConnections ?? []).map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (!opened) return;
    if (initialData) {
      setTitle(initialData.title ?? "");
      setEventType(initialData.eventType ?? "");
      setDate(initialData.date ?? "");
      setLocation(initialData.location ?? "");
      setNotes(initialData.notes ?? "");
      setExpense(initialData.expense != null ? String(initialData.expense) : "");
    } else {
      setTitle(""); setEventType(""); setDate(""); setLocation(""); setNotes(""); setExpense(""); setConnectionIds([]);
    }
  }, [opened, initialData]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(isEditing ? `/api/network/events/${initialData!.id}` : "/api/network/events", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-events"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["network-timeline"] });
      notifications.show({ title: isEditing ? "Updated" : "Created", message: `Event ${isEditing ? "updated" : "created"} successfully`, color: "green" });
      onClose();
    },
    onError: (err) => {
      notifications.show({ title: "Error", message: err instanceof Error ? err.message : "Something went wrong", color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/network/events/${initialData!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-events"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      notifications.show({ title: "Deleted", message: "Event deleted", color: "green" });
      onClose();
    },
  });

  function handleSave() {
    if (!title.trim() || !eventType.trim() || !date) { notifications.show({ title: "Validation", message: "Title, event type, and date are required", color: "red" }); return; }
    mutation.mutate({
      title: title.trim(),
      eventType: eventType.trim(),
      date,
      location: location || undefined,
      notes: notes || undefined,
      expense: expense ? parseInt(expense, 10) : undefined,
      connectionIds: connectionIds.length > 0 ? connectionIds : undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Event" : "Create Event"} size="md">
      <Stack>
        <TextInput label="Title" required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Sarah's Birthday Party" />
        <TextInput label="Event Type" required value={eventType} onChange={(e) => setEventType(e.currentTarget.value)} placeholder="Birthday, Wedding, Reunion..." />
        <TextInput label="Date" required type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} />
        <TextInput label="Location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
        <TextInput label="Expense (Rs.)" type="number" value={expense} onChange={(e) => setExpense(e.currentTarget.value)} />
        <MultiSelect label="Connections" data={connOptions} value={connectionIds} onChange={setConnectionIds} placeholder="Who attended?" searchable clearable />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} minRows={3} />

        <Group justify="space-between" mt="md">
          {isEditing && (
            <Button color="red" variant="light" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(); }}>Delete</Button>
          )}
          <Group ml="auto">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button loading={mutation.isPending} onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
