import { Stack, Skeleton, Paper, SimpleGrid } from "@mantine/core";

export default function DashboardLoading() {
  return (
    <Stack gap="lg" className="pb-8">
      {/* Page Title */}
      <Stack gap={4}>
        <Skeleton height={28} width={160} />
        <Skeleton height={14} width={100} />
      </Stack>

      {/* Welcome Banner */}
      <Skeleton height={100} radius="xl" />

      {/* First row */}
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Skeleton height={100} radius="lg" />
        <Skeleton height={100} radius="lg" />
      </SimpleGrid>

      {/* Stat cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} withBorder p="lg" radius="lg">
            <Stack gap={8}>
              <Skeleton height={12} width="50%" />
              <Skeleton height={28} width="60%" />
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Middle row */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} withBorder p="lg" radius="lg">
            <Stack gap={8}>
              <Skeleton height={14} width="40%" />
              <Skeleton height={80} radius="md" />
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Bottom */}
      <Paper withBorder p="lg" radius="lg">
        <Stack gap="md">
          <Skeleton height={16} width={120} />
          <Skeleton height={60} radius="md" />
          <Skeleton height={60} radius="md" />
        </Stack>
      </Paper>
    </Stack>
  );
}
