"use client";

import { Stack, Title, Text, Paper, Group, Avatar, Divider } from "@mantine/core";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <Stack gap="lg">
      <Title order={2}>Settings</Title>

      <Paper withBorder p="lg" radius="md">
        <Group>
          <Avatar src={user?.imageUrl} size="xl" radius="xl" />
          <div>
            <Text fw={600} size="lg">
              {user?.fullName}
            </Text>
            <Text size="sm" c="dimmed">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </div>
        </Group>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Text fw={500} mb="sm">
          Account
        </Text>
        <Text size="sm" c="dimmed">
          Manage your account settings and preferences through Clerk.
        </Text>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Text fw={500} mb="sm">
          Preferences
        </Text>
        <Text size="sm" c="dimmed">
          Theme, notifications, and other preferences coming soon.
        </Text>
      </Paper>
    </Stack>
  );
}
