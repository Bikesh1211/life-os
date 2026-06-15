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
    <div className="relative overflow-hidden rounded-2xl border border-[var(--mantine-color-dark-4)] bg-gradient-to-br from-[var(--mantine-color-dark-8)] via-[var(--mantine-color-dark-7)] to-[var(--mantine-color-dark-8)] p-6 sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/5 blur-3xl" />

      <Group gap="lg" wrap="nowrap" className="relative z-10">
        <Avatar
          src={imageUrl}
          alt={fullName ?? "User"}
          size={96}
          radius="xl"
          className="ring-2 ring-yellow-500/30"
        />

        <Stack gap={4} style={{ flex: 1 }}>
          <Text fw={700} size="xl" className="text-[var(--mantine-color-text)]">
            {fullName ?? "User"}
          </Text>

          {email && (
            <Group gap="xs">
              <IconMail size={14} className="text-[var(--mantine-color-dimmed)]" />
              <Text size="sm" c="dimmed">
                {email}
              </Text>
            </Group>
          )}

          {createdAt && (
            <Group gap="xs">
              <IconCalendar size={14} className="text-[var(--mantine-color-dimmed)]" />
              <Text size="sm" c="dimmed">
                Joined {joinYear}
              </Text>
            </Group>
          )}
        </Stack>

        <Stack gap={4} align="flex-end">
          <Group gap="xs">
            <IconTrophy size={18} className="text-yellow-500" />
            <Text fw={800} size="28" className="text-yellow-500">
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
