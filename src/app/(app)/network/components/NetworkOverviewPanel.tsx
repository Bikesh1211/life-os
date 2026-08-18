"use client";

import { useEffect, useState } from "react";
import { Container, Title, SimpleGrid, Card, Group, Text, Stack, ThemeIcon, Skeleton } from "@mantine/core";
import {
  IconUsers, IconCake, IconCoffee, IconPhotoHeart, IconGift, IconCalendarEvent, IconPlane, IconHeart,
} from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";
import { apiFetch } from "@/core/api/http";
import { getDashboardStats, getUpcomingBirthdays, getConnections } from "@/modules/network";

type Stats = {
  totalConnections: number;
  upcomingBirthdays: number;
  totalMeetups: number;
  totalMemories: number;
  totalGifts: number;
  totalEvents: number;
  totalTrips: number;
  favoriteCount: number;
};

export function NetworkOverviewPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Stats>("/api/network/stats")
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={80} radius="md" />)}
      </SimpleGrid>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Friends", value: stats.totalConnections, icon: IconUsers, color: "blue" },
    { label: "Upcoming Birthdays", value: stats.upcomingBirthdays, icon: IconCake, color: "pink" },
    { label: "Meetups", value: stats.totalMeetups, icon: IconCoffee, color: "orange" },
    { label: "Memories", value: stats.totalMemories, icon: IconPhotoHeart, color: "violet" },
    { label: "Gifts Tracked", value: stats.totalGifts, icon: IconGift, color: "red" },
    { label: "Events", value: stats.totalEvents, icon: IconCalendarEvent, color: "teal" },
    { label: "Trips Together", value: stats.totalTrips, icon: IconPlane, color: "cyan" },
    { label: "Favorites", value: stats.favoriteCount, icon: IconHeart, color: "grape" },
  ];

  return (
    <>
      <Title order={2} mb="lg">Your Network</Title>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} mb="xl">
        {statCards.map((card) => (
          <Card key={card.label} withBorder padding="md" radius="md">
            <Group gap="sm">
              <ThemeIcon variant="light" color={card.color} size="lg" radius="xl">
                <card.icon size={20} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">{card.label}</Text>
                <Text fw={700} size="xl">{card.value}</Text>
              </Stack>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
