"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton, Stack } from "@mantine/core";
import { KnowledgeTimeline } from "../components/KnowledgeTimeline";
import type { KnowledgeEntry } from "@/modules/knowledge";
import { apiFetch } from "@/core/api/http";

export default function TimelineTab() {
  const { data: entries, isLoading } = useQuery<KnowledgeEntry[]>({
    queryKey: ["knowledge", "entries"],
    queryFn: () => apiFetch<KnowledgeEntry[]>("/api/knowledge"),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={300} />
        <Skeleton height={320} />
      </Stack>
    );
  }

  return <KnowledgeTimeline entries={entries ?? []} />;
}
