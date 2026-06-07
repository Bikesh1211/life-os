"use client";

import { Stack, Title, Text, Paper, Group, Anchor } from "@mantine/core";
import { IconBrain } from "@tabler/icons-react";
import Link from "next/link";

export default function InsightsPage() {
  return (
    <Stack gap="md" align="center" className="pt-12">
      <Group justify="space-between" className="w-full">
        <Title order={2}>Insights</Title>
        <Anchor component={Link} href="/journal" size="sm" c="dimmed">
          &larr; Back to entries
        </Anchor>
      </Group>
      <IconBrain size={48} className="text-gray-300 dark:text-gray-600" />
      <Paper withBorder p="xl" className="max-w-md text-center">
        <Text c="dimmed">
          AI-powered insights are coming soon. Your journal entries will be analyzed to reveal emotional patterns, 
          key life themes, and personal growth trends over time.
        </Text>
      </Paper>
    </Stack>
  );
}
