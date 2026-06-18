"use client";

import { useState, useEffect } from "react";
import { Modal, TextInput, Textarea, Group, Button, Stack, Switch, MultiSelect, Badge, CloseButton, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

type MemoryData = {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  location: string | null;
  tags: string[];
  isFavorite: boolean;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  initialData?: MemoryData | null;
};

export function MemoriesModal({ opened, onClose, initialData }: Props) {
  const isEditing = !!initialData;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
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
      setDescription(initialData.description ?? "");
      setMemoryDate(initialData.memoryDate ?? "");
      setLocation(initialData.location ?? "");
      setTags(initialData.tags ?? []);
      setIsFavorite(initialData.isFavorite ?? false);
    } else {
      setTitle(""); setDescription(""); setMemoryDate(""); setLocation(""); setTags([]); setIsFavorite(false); setConnectionIds([]);
    }
  }, [opened, initialData]);

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEditing ? `/api/network/memories/${initialData!.id}` : "/api/network/memories";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save memory");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-memories"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["network-timeline"] });
      notifications.show({ title: isEditing ? "Updated" : "Created", message: `Memory ${isEditing ? "updated" : "created"} successfully`, color: "green" });
      onClose();
    },
    onError: (err) => {
      notifications.show({ title: "Error", message: err instanceof Error ? err.message : "Something went wrong", color: "red" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/network/memories/${initialData!.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network-memories"] });
      queryClient.invalidateQueries({ queryKey: ["network-dashboard-stats"] });
      notifications.show({ title: "Deleted", message: "Memory deleted", color: "green" });
      onClose();
    },
  });

  function handleSave() {
    if (!title.trim()) { notifications.show({ title: "Validation", message: "Title is required", color: "red" }); return; }
    mutation.mutate({
      title: title.trim(),
      description: description || undefined,
      memoryDate: memoryDate || undefined,
      location: location || undefined,
      tags: tags.length > 0 ? tags : undefined,
      isFavorite,
      connectionIds: connectionIds.length > 0 ? connectionIds : undefined,
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Memory" : "Create Memory"} size="md">
      <Stack>
        <TextInput label="Title" required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Weekend at the beach" />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} minRows={3} />
        <TextInput label="Date" type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.currentTarget.value)} />
        <TextInput label="Location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />

        <div>
          <Text size="sm" fw={500} mb={4}>Tags</Text>
          <Group gap="xs" mb={4}>
            {tags.map((t, i) => (
              <Badge key={i} variant="light" rightSection={<CloseButton size={12} onMouseDown={() => setTags((prev) => prev.filter((_, j) => j !== i))} />}>{t}</Badge>
            ))}
          </Group>
          <Group gap="xs">
            <TextInput value={newTag} onChange={(e) => setNewTag(e.currentTarget.value)} placeholder="Tag name" style={{ flex: 1 }} />
            <Button size="sm" variant="light" onClick={() => { if (newTag.trim()) { setTags((prev) => [...prev, newTag.trim()]); setNewTag(""); } }}>Add</Button>
          </Group>
        </div>

        <MultiSelect label="Connections" data={connOptions} value={connectionIds} onChange={setConnectionIds} placeholder="Who is this memory with?" searchable clearable />

        <Switch label="Mark as favorite" checked={isFavorite} onChange={(e) => setIsFavorite(e.currentTarget.checked)} />

        <Group justify="space-between" mt="md">
          {isEditing && (
            <Button color="red" variant="light" loading={deleteMutation.isPending} onClick={() => { if (confirm("Delete this memory?")) deleteMutation.mutate(); }}>Delete</Button>
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
