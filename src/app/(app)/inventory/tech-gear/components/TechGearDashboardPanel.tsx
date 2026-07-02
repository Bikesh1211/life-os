"use client";

import { useEffect, useState } from "react";
import { Card, Text, Group, Stack, SimpleGrid, RingProgress, Badge, Title, Anchor, Skeleton, Center, Button } from "@mantine/core";
import { IconDeviceLaptop, IconHeart, IconShieldCheck, IconCurrencyDollar, IconUsers, IconPlus, IconTool } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  favoriteItems: number;
  loanedItems: number;
  brokenItems: number;
  warrantyExpiring: number;
  categoryBreakdown: Record<string, number>;
  topBrands: { brand: string; count: number }[];
  recentlyAdded: any[];
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group gap="sm">
        <Icon size={28} color={`var(--mantine-color-${color}-6)`} />
        <Stack gap={0}>
          <Text size="sm" c="dimmed">{label}</Text>
          <Text fw={700} size="xl">{value}</Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
      </Group>
    </Card>
  );
}

export function TechGearDashboardPanel() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory/tech-gear/dashboard")
      .then(r => r.ok ? r.json() : Promise.reject("API error"))
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}><Skeleton height={100} /><Skeleton height={100} /><Skeleton height={100} /><Skeleton height={100} /></SimpleGrid>;

  if (!stats || typeof stats.totalItems !== "number" || stats.totalItems === 0) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <IconDeviceLaptop size={64} color="var(--mantine-color-gray-5)" />
          <Title order={3}>Your tech inventory is empty</Title>
          <Text c="dimmed" ta="center">Start tracking your laptops, phones, peripherals, and more</Text>
          <Button leftSection={<IconPlus size={16} />} onClick={() => router.push("/inventory/tech-gear/items?add=true")}>
            Add Your First Item
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Tech Gear Overview</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => router.push("/inventory/tech-gear/items?add=true")}>
          Add Item
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
        <StatCard icon={IconDeviceLaptop} label="Total Items" value={stats.totalItems} color="blue" />
        <StatCard icon={IconHeart} label="Favorites" value={stats.favoriteItems} color="red" />
        <StatCard icon={IconUsers} label="Loaned Out" value={stats.loanedItems} color="orange" />
        <StatCard icon={IconTool} label="Needs Repair" value={stats.brokenItems} color="red" />
        <StatCard icon={IconShieldCheck} label="Warranty Ending" value={stats.warrantyExpiring} color="yellow" />
        <StatCard icon={IconCurrencyDollar} label="Total Value" value={`$${stats.totalValue.toLocaleString()}`} color="green" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600}>Category Breakdown</Text>
            <Anchor component={Link} href="/inventory/tech-gear/items" size="sm">View All</Anchor>
          </Group>
          <Stack gap="xs">
            {Object.entries(stats.categoryBreakdown).slice(0, 8).map(([cat, count]) => (
              <Group key={cat} justify="space-between">
                <Text size="sm" tt="capitalize">{cat.replace("-", " ")}</Text>
                <Group gap={8}>
                  <RingProgress size={28} thickness={3} sections={[{ value: (count / stats.totalItems) * 100, color: "blue" }]} />
                  <Text size="sm" fw={600}>{count}</Text>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md"><Text fw={600}>Top Brands</Text></Group>
          {stats.topBrands.length === 0 ? (
            <Text c="dimmed" size="sm">No brands tracked yet</Text>
          ) : (
            <Stack gap="xs">
              {stats.topBrands.map(({ brand, count }) => (
                <Group key={brand} justify="space-between">
                  <Text size="sm">{brand}</Text>
                  <Badge>{count} items</Badge>
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Recently Added</Text>
          <Anchor component={Link} href="/inventory/tech-gear/items" size="sm">View All</Anchor>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
          {stats.recentlyAdded.slice(0, 8).map((item: any) => (
            <Group key={item.id} gap="xs">
              <IconDeviceLaptop size={14} />
              <Text size="sm">{item.name}</Text>
            </Group>
          ))}
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
