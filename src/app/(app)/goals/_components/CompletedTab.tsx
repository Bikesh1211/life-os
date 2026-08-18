"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconTarget } from "@tabler/icons-react";
import { Card, Text, Progress, Group, Badge } from "@mantine/core";
import dayjs from "dayjs";
import { apiFetch } from "@/core/api/http";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: "long-term" | "short-term";
  status: string;
  progress: number;
  deadline: string | null;
  category: string | null;
  completionDate: string | null;
  reward: string | null;
};

export default function CompletedTab() {
  const router = useRouter();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["goals", "completed"],
    queryFn: () => apiFetch<Goal[]>("/api/goals?status=completed"),
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
            <IconTarget size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Completed Goals Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Completed goals will appear here. Keep working toward your targets!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
          Completed Goals
        </h1>
        <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} achieved
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
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
              <Badge color="green" size="sm" variant="light">
                Completed
              </Badge>
            </Group>
            {goal.description && (
              <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
                {goal.description}
              </Text>
            )}
            <Progress value={100} size="sm" mb="xs" color="green" />
            <Group justify="space-between">
              <Text size="xs" c="dimmed">100% complete</Text>
              {goal.completionDate && (
                <Text size="xs" c="dimmed">
                  {dayjs(goal.completionDate).format("MMM D, YYYY")}
                </Text>
              )}
            </Group>
            {goal.reward && (
              <Text size="xs" c="dimmed" mt="xs">
                Reward: {goal.reward}
              </Text>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
