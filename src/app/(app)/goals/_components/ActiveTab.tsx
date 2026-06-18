"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconActivity } from "@tabler/icons-react";
import { Card, Text, Progress, Group, Badge } from "@mantine/core";
import dayjs from "dayjs";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: "long-term" | "short-term";
  status: string;
  progress: number;
  deadline: string | null;
  category: string | null;
};

export default function ActiveTab() {
  const router = useRouter();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["goals", "active"],
    queryFn: () =>
      fetch("/api/goals?status=active").then((r) => (r.ok ? r.json() : [])),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!goals?.length) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconActivity size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Active Goals
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            You don&apos;t have any active goals right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Active Goals
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} in progress
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
          return (
            <Card
              key={goal.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              onClick={() => router.push(`/goals/${goal.id}`)}
              style={{ cursor: "pointer" }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm" lineClamp={1}>
                  {goal.title}
                </Text>
                <Group gap="xs">
                  {isOverdue && (
                    <Badge color="red" size="sm" variant="light">Overdue</Badge>
                  )}
                  <Badge
                    color={goal.type === "long-term" ? "violet" : "blue"}
                    size="sm"
                    variant="light"
                  >
                    {goal.type === "long-term" ? "Long-term" : "Short-term"}
                  </Badge>
                </Group>
              </Group>
              <Progress value={goal.progress} size="sm" mb="xs" />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{goal.progress}% complete</Text>
                {goal.deadline && (
                  <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
                    {dayjs(goal.deadline).format("MMM D, YYYY")}
                  </Text>
                )}
              </Group>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
