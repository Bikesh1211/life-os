"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack, Group, Text, Paper, Button, TextInput, Textarea,
  ActionIcon, Modal, Loader, Center, Badge, Menu, Tooltip,
  TagsInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconNotebook, IconPlus, IconTrash, IconEdit, IconDotsVertical,
  IconLink, IconFileText,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

type ResearchNote = {
  id: string;
  bookId: string;
  title: string;
  content: string | null;
  sourceType: string | null;
  sourceUrl: string | null;
  tags: string[];
  createdAt: string;
};

export function ResearchNotesPanel({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    sourceType: "",
    sourceUrl: "",
    tags: [] as string[],
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["book-research-notes", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/research`);
      if (!res.ok) throw new Error("Failed to load research notes");
      return res.json() as Promise<ResearchNote[]>;
    },
    enabled: !!bookId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/books/${bookId}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-research-notes", bookId] });
      close();
      resetForm();
      notifications.show({ title: "Created", message: "Note added", color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/books/${bookId}/research/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-research-notes", bookId] });
      close();
      resetForm();
      notifications.show({ title: "Updated", message: "Note updated", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${bookId}/research/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-research-notes", bookId] });
      notifications.show({ title: "Deleted", message: "Note removed", color: "green" });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", sourceType: "", sourceUrl: "", tags: [] });
    setEditingNote(null);
  };

  const openEdit = (note: ResearchNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      sourceType: note.sourceType || "",
      sourceUrl: note.sourceUrl || "",
      tags: note.tags,
    });
    open();
  };

  const handleSubmit = () => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <Center py="xl"><Loader size="sm" /></Center>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconNotebook size={18} opacity={0.5} />
          <Text fw={600} size="sm">Research</Text>
          <Badge size="xs" variant="light">{notes?.length ?? 0}</Badge>
        </Group>
        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={() => { resetForm(); open(); }}>
          Add
        </Button>
      </Group>

      <AnimatePresence mode="popLayout">
        {notes?.length === 0 ? (
          <Paper p="md" withBorder style={{ textAlign: "center" }}>
            <IconFileText size={32} opacity={0.2} />
            <Text size="xs" c="dimmed" mt="xs">No research notes yet</Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {notes?.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
              >
                <Paper withBorder p="sm" radius="sm">
                  <Group justify="space-between" wrap="nowrap" mb={4}>
                    <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                      {note.title}
                    </Text>
                    <Menu withinPortal position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="xs">
                          <IconDotsVertical size={12} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openEdit(note)}>
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => deleteMutation.mutate(note.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  {note.content && (
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {note.content}
                    </Text>
                  )}
                  {note.sourceUrl && (
                    <Group gap={4} mt={4}>
                      <IconLink size={10} opacity={0.4} />
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {note.sourceUrl}
                      </Text>
                    </Group>
                  )}
                  {note.tags.length > 0 && (
                    <Group gap={4} mt={4}>
                      {note.tags.map((tag) => (
                        <Badge key={tag} size="xs" variant="light">{tag}</Badge>
                      ))}
                    </Group>
                  )}
                </Paper>
              </motion.div>
            ))}
          </Stack>
        )}
      </AnimatePresence>

      <Modal
        opened={opened}
        onClose={() => { close(); resetForm(); }}
        title={editingNote ? "Edit Note" : "New Research Note"}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="Note title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
          />
          <Textarea
            label="Content"
            placeholder="Your research notes..."
            minRows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
          />
          <TextInput
            label="Source URL"
            placeholder="https://..."
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.currentTarget.value })}
          />
          <TextInput
            label="Source Type"
            placeholder="e.g. Article, Book, Website, Interview"
            value={formData.sourceType}
            onChange={(e) => setFormData({ ...formData, sourceType: e.currentTarget.value })}
          />
          <TagsInput
            label="Tags"
            placeholder="Add tags"
            value={formData.tags}
            onChange={(v) => setFormData({ ...formData, tags: v })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => { close(); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editingNote ? "Update" : "Create"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
