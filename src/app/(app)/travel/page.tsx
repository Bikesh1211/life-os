"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconPlane, IconBackpack, IconStar, IconWorld, IconBook, IconPhoto, IconCoin, IconToolsKitchen2, IconPlus, IconCompass, IconGlobe, IconPlaneDeparture, IconMapPin } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, RingProgress, SimpleGrid } from "@mantine/core";

type DashboardData = {
  countriesVisited: number;
  visitedCountries: string[];
  citiesExplored: number;
  totalTrips: number;
  completedTrips: number;
  upcomingTrips: number;
  wishlistCount: number;
  journalCount: number;
  photoCount: number;
  restaurantCount: number;
  totalSpent: number;
  spendingByCategory: Record<string, number>;
  averageTripCost: number;
  favoriteDestination: string | null;
  lastTrip: { id: string; title: string; destination: string; endDate: string } | null;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TravelDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/travel/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = data && data.totalTrips === 0 && data.wishlistCount === 0;

  const statsCards = [
    { label: "Countries", value: data?.countriesVisited ?? 0, icon: IconGlobe, color: "blue", sub: "visited" },
    { label: "Trips", value: data?.totalTrips ?? 0, icon: IconPlaneDeparture, color: "violet", sub: `${data?.completedTrips ?? 0} completed` },
    { label: "Wishlist", value: data?.wishlistCount ?? 0, icon: IconStar, color: "yellow", sub: "dream destinations" },
    { label: "Memories", value: (data?.journalCount ?? 0) + (data?.photoCount ?? 0), icon: IconBook, color: "teal", sub: "stories & photos" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Group justify="space-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              Travel
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              {data?.countriesVisited
                ? `${data.countriesVisited} countries · ${data.citiesExplored} cities · ${data.totalTrips} trips`
                : "Your world awaits"}
            </p>
          </div>
          <Group>
            <Button leftSection={<IconPlus size={18} />} onClick={() => router.push("/travel/trips")}>
              New Trip
            </Button>
            <Button leftSection={<IconStar size={18} />} variant="light" onClick={() => router.push("/travel/wishlist")}>
              Add to Wishlist
            </Button>
          </Group>
        </Group>
      </motion.div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconCompass size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            Start Your Journey
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Plan your first trip, add dream destinations to your wishlist, or record places you have visited.
          </p>
          <div className="mt-6 flex gap-3">
            <Button leftSection={<IconPlus size={18} />} onClick={() => router.push("/travel/trips")}>
              Plan a Trip
            </Button>
            <Button leftSection={<IconStar size={18} />} variant="light" onClick={() => router.push("/travel/wishlist")}>
              Dream Destination
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
            {statsCards.map((s) => (
              <motion.div key={s.label} variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb={4}>
                    <s.icon size={18} style={{ color: `var(--mantine-color-${s.color}-6)` }} />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                      {s.label}
                    </Text>
                  </Group>
                  <Text size="xl" fw={700}>
                    {s.value}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {s.sub}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            {data && data.totalSpent > 0 && (
              <motion.div variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb="sm">
                    <IconCoin size={18} className="text-[var(--mantine-color-green-6)]" />
                    <Text fw={600} size="sm">Travel Spending</Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    ${(data.totalSpent / 100).toLocaleString()}
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">total across all trips</Text>
                  {data.averageTripCost > 0 && (
                    <Text size="xs" c="dimmed">
                      avg ${(data.averageTripCost / 100).toLocaleString()} per trip
                    </Text>
                  )}
                </Card>
              </motion.div>
            )}

            {data && data.favoriteDestination && (
              <motion.div variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb="sm">
                    <IconMapPin size={18} className="text-[var(--mantine-color-red-6)]" />
                    <Text fw={600} size="sm">Favorite Place</Text>
                  </Group>
                  <Text size="lg" fw={700}>{data.favoriteDestination}</Text>
                  <Text size="xs" c="dimmed">highest rated destination</Text>
                </Card>
              </motion.div>
            )}

            {data && data.lastTrip && (
              <motion.div variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb="sm">
                    <IconPlaneDeparture size={18} className="text-[var(--mantine-color-blue-6)]" />
                    <Text fw={600} size="sm">Last Trip</Text>
                  </Group>
                  <Text size="lg" fw={700} lineClamp={1}>{data.lastTrip.title}</Text>
                  <Text size="xs" c="dimmed">{data.lastTrip.destination}</Text>
                </Card>
              </motion.div>
            )}

            {data && data.visitedCountries.length > 0 && (
              <motion.div variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb="sm">
                    <IconGlobe size={18} className="text-[var(--mantine-color-cyan-6)]" />
                    <Text fw={600} size="sm">Explored</Text>
                  </Group>
                  <Text size="lg" fw={700}>{data.visitedCountries.length}</Text>
                  <Text size="xs" c="dimmed">countries</Text>
                  <Group gap={4} mt="xs">
                    {data.visitedCountries.slice(0, 5).map((c) => (
                      <Badge key={c} size="sm" variant="light" color="cyan">
                        {c}
                      </Badge>
                    ))}
                    {data.visitedCountries.length > 5 && (
                      <Text size="xs" c="dimmed">+{data.visitedCountries.length - 5} more</Text>
                    )}
                  </Group>
                </Card>
              </motion.div>
            )}

            {data && data.restaurantCount > 0 && (
              <motion.div variants={item}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Group gap="xs" mb="sm">
                    <IconToolsKitchen2 size={18} className="text-[var(--mantine-color-orange-6)]" />
                    <Text fw={600} size="sm">Food Memories</Text>
                  </Group>
                  <Text size="lg" fw={700}>{data.restaurantCount}</Text>
                  <Text size="xs" c="dimmed">restaurants tried</Text>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
