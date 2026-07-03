"use client";

import { Skeleton, Stack, Group, Paper, SimpleGrid } from "@mantine/core";

export function PageTitleSkeleton() {
  return (
    <Stack gap={4} mb="lg">
      <Skeleton height={32} width={200} />
      <Skeleton height={16} width={140} />
    </Stack>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: Math.min(count, 4) }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="lg" radius="lg">
          <Stack gap={8}>
            <Skeleton height={12} width="50%" />
            <Skeleton height={28} width="60%" />
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export function CardGridSkeleton({ count = 3, height = 160 }: { count?: number; height?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="lg" radius="lg">
          <Stack gap="sm">
            <Skeleton height={14} width="40%" />
            <Skeleton height={height} radius="md" />
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Paper withBorder radius="lg" className="overflow-hidden">
      <Stack gap={0}>
        <div className="flex gap-4 px-4 py-3 border-b border-default-border">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height={14} width={i === 0 ? 120 : 60} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 py-3 border-b border-default-border last:border-0">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height={14} width={c === 0 ? 160 : 80} />
            ))}
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Paper withBorder p="lg" radius="lg">
      <Stack gap="md">
        <Skeleton height={18} width={140} />
        <Skeleton height={height} radius="md" />
      </Stack>
    </Paper>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }).map((_, i) => (
        <Paper key={i} withBorder p="md" radius="lg">
          <Group gap="md" wrap="nowrap">
            <Skeleton height={40} circle />
            <Stack gap={4} style={{ flex: 1 }}>
              <Skeleton height={14} width="60%" />
              <Skeleton height={12} width="40%" />
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
