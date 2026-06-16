"use client";

import { Paper, Group, Skeleton } from "@mantine/core";

export function TaskSkeleton() {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Skeleton height={18} width={18} radius="sm" mt={3} />
        <div style={{ flex: 1 }}>
          <Skeleton height={16} width="60%" mb={6} />
          <Skeleton height={12} width="30%" />
        </div>
        <Group gap={4}>
          <Skeleton height={24} width={24} radius="sm" />
          <Skeleton height={24} width={24} radius="sm" />
        </Group>
      </Group>
    </Paper>
  );
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </>
  );
}