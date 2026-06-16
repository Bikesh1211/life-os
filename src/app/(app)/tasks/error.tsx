"use client";

import { Stack, Title, Text, Button, Paper, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Stack gap="lg" align="center" py="xl">
      <Paper withBorder p="xl" radius="md" ta="center" maw={500}>
        <Group justify="center" mb="md">
          <IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
        </Group>
        <Title order={3} mb="xs">Something went wrong</Title>
        <Text size="sm" c="dimmed" mb="lg">
          {error.message || "An unexpected error occurred while loading tasks."}
        </Text>
        <Button onClick={reset} variant="filled">
          Try again
        </Button>
      </Paper>
    </Stack>
  );
}