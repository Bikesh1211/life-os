"use client";

import { useQuery } from "@tanstack/react-query";
import { Container, Title, Card, Group, Text, Stack, ThemeIcon, Badge, SimpleGrid } from "@mantine/core";
import { IconPlane } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";
import { FeaturePlaceholder } from "@/components/shared/FeaturePlaceholder";

type Trip = {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
};

export function TripsContent() {
  const { data: trips, isLoading } = useQuery({
    queryKey: ["travel-trips"],
    queryFn: () => apiFetch<Trip[]>("/api/travel/trips"),
  });

  const tripList = trips ?? [];

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Trips Together</Title>
      <Text size="sm" c="dimmed" mb="md">
        Trips you've taken with connections ({tripList.length} recorded)
      </Text>

      {tripList.length === 0 && !isLoading ? (
        <FeaturePlaceholder
          title="Trips with Friends"
          description="Trips are managed in the Travel module. Link connections to your trips there."
          icon={IconPlane}
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
          {tripList.map((trip) => (
            <Card key={trip.id} withBorder padding="md" radius="md">
              <Stack>
                <Group>
                  <ThemeIcon variant="light" color="cyan" size="lg" radius="xl">
                    <IconPlane size={20} />
                  </ThemeIcon>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={500}>{trip.title}</Text>
                    <Text size="sm" c="dimmed">{trip.destination}{trip.country ? `, ${trip.country}` : ""}</Text>
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Badge variant="light" size="sm" color={statusColor(trip.status)}>{trip.status}</Badge>
                  {trip.startDate && (
                    <Text size="xs" c="dimmed">{formatDateRange(trip.startDate, trip.endDate)}</Text>
                  )}
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case "planning": return "blue";
    case "booked": return "violet";
    case "in_progress": return "green";
    case "completed": return "gray";
    case "cancelled": return "red";
    default: return "gray";
  }
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "";
  const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s} - ${e}`;
}
