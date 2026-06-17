import { Skeleton, Stack, Group, Paper, SimpleGrid, Container } from "@mantine/core";

export function ListPageSkeleton({
  titleWidth = 120,
  subtitleWidth,
  count = 5,
}: {
  titleWidth?: number;
  subtitleWidth?: number;
  count?: number;
}) {
  return (
    <Stack gap="md">
      <div className="flex justify-between">
        <Skeleton height={32} width={titleWidth} />
        {subtitleWidth && <Skeleton height={20} width={subtitleWidth} />}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={72} radius="md" />
      ))}
    </Stack>
  );
}

export function DetailPageSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={20} width={80} />
      <Skeleton height={36} width="60%" />
      <Skeleton height={200} radius="md" />
      <Stack gap="sm">
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="90%" />
      </Stack>
    </Stack>
  );
}

export function DashboardSkeleton({
  statCards = 4,
  chartCount = 2,
}: {
  statCards?: number;
  chartCount?: number;
}) {
  return (
    <Container size="xl">
      <Stack gap="lg">
        <div className="flex justify-between">
          <Skeleton height={36} width={200} />
          <Skeleton height={36} width={120} radius="md" />
        </div>
        <SimpleGrid cols={{ base: 1, sm: 2, md: statCards > 4 ? 4 : statCards }} spacing="md">
          {Array.from({ length: statCards }).map((_, i) => (
            <Paper key={i} withBorder p="lg" radius="lg">
              <Stack gap="xs">
                <Skeleton height={14} width="40%" />
                <Skeleton height={28} width="60%" />
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
        {Array.from({ length: chartCount }).map((_, i) => (
          <Paper key={i} withBorder p="lg" radius="lg">
            <Skeleton height={24} width={160} mb="md" />
            <Skeleton height={i === 0 ? 300 : 200} radius="md" />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

export function TabbedPageSkeleton() {
  return (
    <Stack gap="md">
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/[0.08] pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={32} width={i === 0 ? 120 : 80} radius="md" />
        ))}
      </div>
      <Skeleton height={400} radius="md" />
    </Stack>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: Math.min(count, 4) }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <Stack gap="xs">
            <Skeleton height={12} width="50%" />
            <Skeleton height={24} width="70%" />
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export function CardGridSkeleton({
  count = 6,
  height = 120,
}: {
  count?: number;
  height?: number;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <Skeleton height={height} radius="sm" />
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Paper withBorder p="lg" radius="lg">
      <Skeleton height={24} width={160} mb="md" />
      <Skeleton height={height} radius="md" />
    </Paper>
  );
}

export function FormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={20} width={80} />
      <Skeleton height={36} radius="md" />
      <Skeleton height={36} radius="md" />
      <Skeleton height={120} radius="md" />
      <Skeleton height={36} width={120} radius="md" />
    </Stack>
  );
}
