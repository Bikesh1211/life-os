import { getCurrentUserId } from "@/core/auth";
import { getDashboardStats, getUpcomingBirthdays, getConnections, getMeetups } from "@/modules/network";
import { Container, Title, SimpleGrid, Card, Group, Text, Badge, Stack, ThemeIcon } from "@mantine/core";
import {
  IconUsers,
  IconCake,
  IconCoffee,
  IconPhotoHeart,
  IconGift,
  IconCalendarEvent,
  IconPlane,
  IconHeart,
} from "@tabler/icons-react";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

export default async function NetworkOverviewPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [stats, birthdays, connections] = await Promise.all([
    getDashboardStats(userId),
    getUpcomingBirthdays(userId),
    getConnections(userId),
  ]);

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
    <Container size="xl">
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

      {birthdays.length > 0 && (
        <>
          <Title order={3} mb="sm">Upcoming Birthdays</Title>
          <Stack mb="xl">
            {birthdays.map((b) => (
              <Card key={b.id} withBorder padding="sm" radius="md">
                <Group>
                  <ThemeIcon variant="light" color="pink" size="lg" radius="xl">
                    <IconCake size={20} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text fw={500}>{b.name}</Text>
                    <Text size="sm" c="dimmed">{b.birthday}</Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        </>
      )}

      {connections.length === 0 && (
        <FeaturePlaceholder
          title="No connections yet"
          description="Add your first connection to start tracking relationships"
          icon={IconUsers}
        />
      )}
    </Container>
  );
}
