"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Paper, Stack, Text, Group, Button, Select, Loader, Center, Avatar } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUserPlus, IconTrash } from "@tabler/icons-react";

type Collaborator = {
  id: string;
  userId: string;
  role: "owner" | "editor" | "commenter" | "viewer";
  createdAt: string;
};

export function CollaboratorList({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient();

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ["book-collaborators", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}/collaborators`);
      if (!res.ok) throw new Error("Failed to load collaborators");
      return res.json() as Promise<Collaborator[]>;
    },
    enabled: !!bookId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/books/${bookId}/collaborators/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-collaborators", bookId] });
      notifications.show({ title: "Updated", message: "Role updated", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to update role", color: "red" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/books/${bookId}/collaborators/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove collaborator");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-collaborators", bookId] });
      notifications.show({ title: "Removed", message: "Collaborator removed", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Error", message: "Failed to remove", color: "red" });
    },
  });

  if (isLoading) {
    return <Center h={200}><Loader size="sm" /></Center>;
  }

  return (
    <Paper withBorder p="xl" radius="md" maw={700}>
      <Stack gap="md">
        <Text fw={600}>Collaborators</Text>
        <Text size="sm" c="dimmed">
          Invite others to collaborate on this book. Owners can manage settings and collaborators.
          Editors can edit content. Commenters can add comments. Viewers can read.
        </Text>

        {(!collaborators || collaborators.length === 0) ? (
          <Text size="sm" c="dimmed">No collaborators yet</Text>
        ) : (
          <Stack gap="sm">
            {collaborators.map((collab) => (
              <Group key={collab.id} justify="space-between" wrap="nowrap">
                <Group gap="sm">
                  <Avatar size="sm" radius="xl" color="blue">
                    {collab.userId.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <div>
                    <Text size="sm">{collab.userId}</Text>
                    <Text size="xs" c="dimmed">Added {new Date(collab.createdAt).toLocaleDateString()}</Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <Select
                    size="xs"
                    value={collab.role}
                    data={[
                      { value: "owner", label: "Owner" },
                      { value: "editor", label: "Editor" },
                      { value: "commenter", label: "Commenter" },
                      { value: "viewer", label: "Viewer" },
                    ]}
                    onChange={(v) => {
                      if (v) updateRoleMutation.mutate({ id: collab.id, role: v });
                    }}
                    style={{ width: 130 }}
                    disabled={collab.role === "owner"}
                  />
                  {collab.role !== "owner" && (
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => removeMutation.mutate(collab.id)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  )}
                </Group>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
