"use client";

import { useState } from "react";
import { Modal, Stack, Group, Text, Button, TextInput, Badge, Loader, Center } from "@mantine/core";
import { IconCheck, IconSearch } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/http";

type Habit = {
  id: string;
  title: string;
  category: string | null;
  frequency: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function HabitQuickLogModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const { data: habits, isLoading } = useQuery<Habit[]>({
    queryKey: ["habits-list"],
    queryFn: async () => {
      const data = await apiFetch<{ habits?: Habit[] }>("/api/habits/analytics/summary");
      return data.habits ?? [];
    },
    enabled: opened,
  });

  const logMutation = useMutation({
    mutationFn: async (habitId: string) => {
      setLoggingId(habitId);
      const today = new Date().toISOString().split("T")[0];
      return apiFetch("/api/habits/completions", {
        method: "POST",
        body: JSON.stringify({ habitId, completedDate: today }),
      });
    },
    onSettled: () => {
      setLoggingId(null);
      queryClient.invalidateQueries({ queryKey: ["habits-list"] });
      queryClient.invalidateQueries({ queryKey: ["habit-analytics-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["habit-summary"] });
    },
  });

  const filtered = (habits ?? []).filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Log Habit"
      size="sm"
      closeOnClickOutside
    >
      <Stack gap="sm">
        <TextInput
          placeholder="Search habits..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          autoFocus
        />

        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : filtered.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            {search ? "No habits match your search." : "No habits yet."}
          </Text>
        ) : (
          filtered.map((habit) => (
            <Group key={habit.id} justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" truncate>
                  {habit.title}
                </Text>
                {habit.category && (
                  <Badge size="xs" variant="dot" color="gray">
                    {habit.category}
                  </Badge>
                )}
              </Group>
              <Button
                size="compact-sm"
                variant="light"
                color="green"
                leftSection={<IconCheck size={14} />}
                loading={loggingId === habit.id}
                onClick={() => logMutation.mutate(habit.id)}
              >
                Done
              </Button>
            </Group>
          ))
        )}
      </Stack>
    </Modal>
  );
}
