"use client";

import { Center, Stack, Title, Text } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";

export default function WardrobeAnalyticsPage() {
  return (
    <Center h={400}>
      <Stack align="center" gap="md">
        <IconChartBar size={64} color="var(--mantine-color-gray-5)" />
        <Title order={3}>Analytics Coming Soon</Title>
        <Text c="dimmed" ta="center">Wear frequency charts, season distribution,<br />investment breakdown, and more.</Text>
      </Stack>
    </Center>
  );
}
