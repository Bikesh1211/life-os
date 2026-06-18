"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Stack, SimpleGrid, MultiSelect } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

type MeetupData = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  notes: string | null;
  mood: string | null;
  expense: number | null;
  photos: string[];
};

type Props = {
  opened: boolean;
  onClose: () => void;
  initialData?: MeetupData | null;
};

export function MeetupsModal({ opened, onClose, initialData }: Props) {
  const isEditing = !!initialData;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("");
  const [expense, setExpense] = useState("");
  const [connectionIds, setConnectionIds] = useState<string[]>([]);

  const { data: allConnections } = useQuery({
    queryKey: ["network-connections"],
    queryFn: async () => {
      const res = await fetch("/api/network/connections");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ id: string; name: string }[]>;
    },
  });

  const connOptions = (allConnections ?? []).map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (!opened) return;
    if (initialData) {
      setTitle(initialData.title ?? "");
      setDate(initialData.date ?? "");
      setLocation(initialData.location ?? "");
      setNotes(initialData.notes ?? "");
      setMood(initialData.mood ?? "");
      setExpense(initialData.expense != null ? String(initialData.expense) : "");
    } else {
      setTitle(""); setDate(""); setLocation(""); setNotes(""); setMood(""); setExpense(""); setConnectionIds([]);
    }
  }, [opened, initialData]);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing ? `/api/network/meetups/${initialData!.id}` : "/api/network/meetups";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save meetup");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-meetups"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["network-timeline"] });
      notifications.show({ title: isEditing ? "Updated" : "Created", message: `Meetup ${isEditing ? "updated" : "created"} successfully`, color: "green" });
      onClose();
    },
    onError: (err) => {
      notifications.show({ title: "Error", message: err instanceof Error ? err.message : "Something went wrong", color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/network/meetups/${initialData!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-meetups"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      notifications.show({ title: "Deleted", message: "Meetup deleted", color: "green" });
      onClose();
    },
  });

  function handleSave() {
    if (!title.trim() || !date) { notifications.show({ title: "Validation", message: "Title and date are required", color: "red" }); return; }
    mutation.mutate({
      title: title.trim(),
      date,
      location: location || undefined,
      notes: notes || undefined,
      mood: mood || undefined,
      expense: expense ? parseInt(expense, 10) : undefined,
      connectionIds: connectionIds.length > 0 ? connectionIds : undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Meetup" : "Log Meetup"} size="md">
      <Stack>
        <TextInput label="Title" required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Coffee with Sarah" />
        <TextInput label="Date" required type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} />
        <TextInput label="Location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} placeholder="Blue Tokai, Indiranagar" />
        <TextInput label="Mood" value={mood} onChange={(e) => setMood(e.currentTarget.value)} placeholder="Fun, relaxed..." />
        <TextInput label="Expense (Rs.)" type="number" value={expense} onChange={(e) => setExpense(e.currentTarget.value)} />
        <MultiSelect label="Connections" data={connOptions} value={connectionIds} onChange={setConnectionIds} placeholder="Who was there?" searchable clearable />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} minRows={3} />

        <Group justify="space-between" mt="md">
          {isEditing && (
            <Button color="red" variant="light" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this meetup?")) deleteMutation.mutate(); }}>Delete</Button>
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
