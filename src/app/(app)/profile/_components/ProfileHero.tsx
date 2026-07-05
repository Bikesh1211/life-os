"use client";

import { Avatar, Group, Text, Stack, Box } from "@mantine/core";
import { IconCalendar, IconMail, IconTrophy } from "@tabler/icons-react";

type ProfileHeroProps = {
  fullName: string | null;
  email: string | null;
  imageUrl: string;
  level: number;
  totalXp: number;
  progress: number;
  createdAt: Date | null;
};

export function ProfileHero({
  fullName,
  email,
  imageUrl,
  level,
  totalXp,
  progress,
  createdAt,
}: ProfileHeroProps) {
  const joinYear = createdAt?.getFullYear() ?? "—";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--mantine-color-dark-8)] via-[var(--mantine-color-dark-7)] to-[var(--mantine-color-dark-8)] p-4 sm:p-5">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/5 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gradient-to-tr from-blue-500/10 to-cyan-500/5 blur-3xl" />

      <Group gap="md" wrap="wrap" className="relative z-10">
        <Avatar
          src={imageUrl}
          alt={fullName ?? "User"}
          size={64}
          radius="xl"
          className="ring-2 ring-yellow-500/30"
        />

        <Stack gap={2} style={{ flex: 1, minWidth: 160 }}>
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

        <Box
          px="sm"
          py={4}
          className="w-full sm:w-auto"
          style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            justifyContent: "center",
          }}
        >
          <IconTrophy size={14} color="#f59e0b" />
          <Text size="xs" c="amber.5" fw={600}>
            Lvl {level}
          </Text>
          <Box
            style={{
              width: 60,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#d97706",
                borderRadius: 2,
                transition: "width 0.5s ease",
              }}
            />
          </Box>
          <Text size="10px" c="gray.5">
            {totalXp.toLocaleString()} XP
          </Text>
        </Box>
      </Group>
    </div>
  );
}
