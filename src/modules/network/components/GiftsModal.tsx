"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Stack, Select, SimpleGrid } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { apiFetch } from "@/core/api/http";

type GiftData = {
  id: string;
  giftName: string;
  direction: "given" | "received";
  connectionId: string;
  occasion: string | null;
  price: number | null;
  date: string;
  notes: string | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  initialData?: GiftData | null;
};

export function GiftsModal({ opened, onClose, initialData }: Props) {
  const isEditing = !!initialData;
  const queryClient = useQueryClient();

  const [giftName, setGiftName] = useState("");
  const [direction, setDirection] = useState<string>("given");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: allConnections } = useQuery({
    queryKey: ["network-connections"],
    queryFn: () => apiFetch<{ id: string; name: string }[]>("/api/network/connections"),
  });

  const connOptions = (allConnections ?? []).map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (!opened) return;
    if (initialData) {
      setGiftName(initialData.giftName ?? "");
      setDirection(initialData.direction ?? "given");
      setConnectionId(initialData.connectionId ?? null);
      setOccasion(initialData.occasion ?? "");
      setPrice(initialData.price != null ? String(initialData.price) : "");
      setDate(initialData.date ?? "");
      setNotes(initialData.notes ?? "");
    } else {
      setGiftName(""); setDirection("given"); setConnectionId(null); setOccasion(""); setPrice(""); setDate(""); setNotes("");
    }
  }, [opened, initialData]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(isEditing ? `/api/network/gifts/${initialData!.id}` : "/api/network/gifts", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-gifts"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      notifications.show({ title: isEditing ? "Updated" : "Created", message: `Gift ${isEditing ? "updated" : "created"} successfully`, color: "green" });
      onClose();
    },
    onError: (err) => {
      notifications.show({ title: "Error", message: err instanceof Error ? err.message : "Something went wrong", color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/network/gifts/${initialData!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-gifts"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      notifications.show({ title: "Deleted", message: "Gift deleted", color: "green" });
      onClose();
    },
  });

  function handleSave() {
    if (!giftName.trim() || !connectionId || !date) { notifications.show({ title: "Validation", message: "Gift name, person, and date are required", color: "red" }); return; }
    mutation.mutate({
      giftName: giftName.trim(),
      direction,
      connectionId,
      occasion: occasion || undefined,
      price: price ? parseInt(price, 10) : undefined,
      date,
      notes: notes || undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Gift" : "Track Gift"} size="md">
      <Stack>
        <TextInput label="Gift Name" required value={giftName} onChange={(e) => setGiftName(e.currentTarget.value)} placeholder="Leather journal" />
        <Select label="Direction" data={[{ value: "given", label: "Given" }, { value: "received", label: "Received" }]} value={direction} onChange={(v) => setDirection(v ?? "given")} />
        <Select label="Person" required data={connOptions} value={connectionId} onChange={setConnectionId} placeholder="Select a connection" searchable clearable />
        <SimpleGrid cols={2}>
          <TextInput label="Occasion" value={occasion} onChange={(e) => setOccasion(e.currentTarget.value)} placeholder="Birthday, Anniversary..." />
          <TextInput label="Price (Rs.)" type="number" value={price} onChange={(e) => setPrice(e.currentTarget.value)} />
        </SimpleGrid>
        <TextInput label="Date" required type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} minRows={2} />

        <Group justify="space-between" mt="md">
          {isEditing && (
            <Button color="red" variant="light" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this gift?")) deleteMutation.mutate(); }}>Delete</Button>
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
