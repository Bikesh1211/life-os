"use client";

import { Center, Stack, Title, Text } from "@mantine/core";
import { IconTools } from "@tabler/icons-react";

export default function TechMaintenancePage() {
  return (
    <Center h={400}>
      <Stack align="center" gap="md">
        <IconTools size={64} color="var(--mantine-color-gray-5)" />
        <Title order={3}>Maintenance Log</Title>
        <Text c="dimmed" ta="center">Repair and service history coming soon.</Text>
      </Stack>
    </Center>
  );
}
