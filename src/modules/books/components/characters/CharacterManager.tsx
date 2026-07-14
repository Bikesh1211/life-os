"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack, Group, Text, Paper, Button, TextInput, Textarea,
  ActionIcon, Modal, Loader, Center, Badge, SimpleGrid,
  Menu, Tooltip, ColorInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconUsers, IconPlus, IconTrash, IconEdit, IconDotsVertical,
  IconUser, IconPhoto,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

type Character = {
  id: string;
  bookId: string;
  name: string;
  imageUrl: string | null;
  age: string | null;
  personality: string | null;
  background: string | null;
  appearance: string | null;
  goals: string | null;
  notes: string | null;
  color: string | null;
};

export function CharacterManager({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    personality: "",
    background: "",
    appearance: "",
    goals: "",
    notes: "",
    imageUrl: "",
    color: "",
  });

  const { data: characters, isLoading } = useQuery({
    queryKey: ["book-characters", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/characters`);
      if (!res.ok) throw new Error("Failed to load characters");
      return res.json() as Promise<Character[]>;
    },
    enabled: !!bookId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/books/${bookId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create character");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-characters", bookId] });
      close();
      resetForm();
      notifications.show({ title: "Created", message: "Character added", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to create character", color: "red" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/books/${bookId}/characters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update character");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-characters", bookId] });
      close();
      resetForm();
      notifications.show({ title: "Updated", message: "Character updated", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${bookId}/characters/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete character");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-characters", bookId] });
      notifications.show({ title: "Deleted", message: "Character removed", color: "green" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", age: "", personality: "", background: "", appearance: "", goals: "", notes: "", imageUrl: "", color: "" });
    setEditingCharacter(null);
  };

  const openEdit = (char: Character) => {
    setEditingCharacter(char);
    setFormData({
      name: char.name,
      age: char.age || "",
      personality: char.personality || "",
      background: char.background || "",
      appearance: char.appearance || "",
      goals: char.goals || "",
      notes: char.notes || "",
      imageUrl: char.imageUrl || "",
      color: char.color || "",
    });
    open();
  };

  const handleSubmit = () => {
    if (editingCharacter) {
      updateMutation.mutate({ id: editingCharacter.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconUsers size={18} opacity={0.5} />
          <Text fw={600} size="sm">Characters</Text>
          <Badge size="xs" variant="light">{characters?.length ?? 0}</Badge>
        </Group>
        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => { resetForm(); open(); }}>
          Add
        </Button>
      </Group>

      <AnimatePresence mode="popLayout">
        {characters?.length === 0 ? (
          <Paper p="md" withBorder style={{ textAlign: "center" }}>
            <IconUser size={32} opacity={0.2} />
            <Text size="xs" c="dimmed" mt="xs">No characters yet</Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {characters?.map((char) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
              >
                <Paper withBorder p="sm" radius="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: char.color || "var(--mantine-color-blue-6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Text size="xs" fw={700} style={{ color: "#fff" }}>
                          {char.name.charAt(0)}
                        </Text>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500} lineClamp={1}>{char.name}</Text>
                        {(char.age || char.personality) && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {[char.age, char.personality].filter(Boolean).join(" · ")}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <Menu withinPortal position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="xs">
                          <IconDotsVertical size={12} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openEdit(char)}>
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => deleteMutation.mutate(char.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        )}
      </AnimatePresence>

      <Modal
        opened={opened}
        onClose={() => { close(); resetForm(); }}
        title={editingCharacter ? "Edit Character" : "New Character"}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="Character name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          />
          <SimpleGrid cols={2} spacing="sm">
            <TextInput
              label="Age"
              placeholder="e.g. 25, Young, Ancient"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.currentTarget.value })}
            />
            <TextInput
              label="Image URL"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.currentTarget.value })}
            />
          </SimpleGrid>
          <Textarea
            label="Personality"
            placeholder="Personality traits, temperament, quirks..."
            minRows={2}
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.currentTarget.value })}
          />
          <Textarea
            label="Background"
            placeholder="Backstory, history, origins..."
            minRows={2}
            value={formData.background}
            onChange={(e) => setFormData({ ...formData, background: e.currentTarget.value })}
          />
          <Textarea
            label="Appearance"
            placeholder="Physical description..."
            minRows={2}
            value={formData.appearance}
            onChange={(e) => setFormData({ ...formData, appearance: e.currentTarget.value })}
          />
          <Textarea
            label="Goals"
            placeholder="What drives this character?"
            minRows={2}
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.currentTarget.value })}
          />
          <Textarea
            label="Notes"
            placeholder="Additional notes..."
            minRows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
          />
          <ColorInput
            label="Color"
            placeholder="Pick a color"
            value={formData.color}
            onChange={(c) => setFormData({ ...formData, color: c })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => { close(); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editingCharacter ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
