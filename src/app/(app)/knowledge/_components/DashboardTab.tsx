"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton, Stack } from "@mantine/core";
import { KnowledgeDashboard } from "../components/KnowledgeDashboard";
import type { KnowledgeEntry } from "@/modules/knowledge";

type DashboardStats = {
  total: number;
  learnedToday: number;
  learnedThisWeek: number;
  learnedThisMonth: number;
  totalHours: number;
  mostActiveSubject: string | null;
  entriesBySubject: Record<string, number>;
};

export default function DashboardTab() {
  const { data: entries, isLoading: entriesLoading } = useQuery<KnowledgeEntry[]>({
    queryKey: ["knowledge", "entries"],
    queryFn: () => fetch("/api/knowledge").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["knowledge", "stats"],
    queryFn: () => fetch("/api/knowledge/stats").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (entriesLoading || statsLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={300} />
        <Skeleton height={140} />
        <Skeleton height={320} />
      </Stack>
    );
  }

  return <KnowledgeDashboard entries={entries ?? []} stats={stats!} />;
}
