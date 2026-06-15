"use client";

import { Avatar, Group, Text, Stack, Badge } from "@mantine/core";
import { IconCalendar, IconMail, IconTrophy } from "@tabler/icons-react";

type ProfileHeroProps = {
  fullName: string | null;
  email: string | null;
  imageUrl: string;
  level: number;
  totalXp: number;
  createdAt: Date | null;
};

export function ProfileHero({
  fullName,
  email,
  imageUrl,
  level,
  totalXp,
  createdAt,
}: ProfileHeroProps) {
  const joinYear = createdAt?.getFullYear() ?? "—";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--mantine-color-dark-4)] bg-gradient-to-br from-[var(--mantine-color-dark-8)] via-[var(--mantine-color-dark-7)] to-[var(--mantine-color-dark-8)] p-4 sm:p-5">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/5 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/5 blur-3xl" />

      <Group gap="md" wrap="nowrap" className="relative z-10">
        <Avatar
          src={imageUrl}
          alt={fullName ?? "User"}
          size={64}
          radius="xl"
          className="ring-2 ring-yellow-500/30"
        />

        <Stack gap={2} style={{ flex: 1 }}>
          <Text fw={700} size="lg" className="text-[var(--mantine-color-text)]">
            {fullName ?? "User"}
          </Text>

          {email && (
            <Group gap="xs">
              <IconMail size={13} className="text-[var(--mantine-color-dimmed)]" />
              <Text size="sm" c="dimmed">
                {email}
              </Text>
            </Group>
          )}

          {createdAt && (
            <Group gap="xs">
              <IconCalendar size={13} className="text-[var(--mantine-color-dimmed)]" />
              <Text size="sm" c="dimmed">
                Joined {joinYear}
              </Text>
            </Group>
          )}
        </Stack>

        <Stack gap={2} align="flex-end">
          <Group gap="xs">
            <IconTrophy size={16} className="text-yellow-500" />
            <Text fw={800} size="xl" className="text-yellow-500">
              {level}
            </Text>
          </Group>
          <Badge variant="light" color="yellow" size="sm">
            {totalXp.toLocaleString()} XP
          </Badge>
        </Stack>
      </Group>
    </div>
  );
}
