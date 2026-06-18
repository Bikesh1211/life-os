"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton, Stack } from "@mantine/core";
import { KnowledgeLibrary } from "../components/KnowledgeLibrary";
import type { KnowledgeEntry } from "@/modules/knowledge";

export default function LibraryTab() {
  const { data: entries, isLoading: entriesLoading } = useQuery<KnowledgeEntry[]>({
    queryKey: ["knowledge", "entries"],
    queryFn: () => fetch("/api/knowledge").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery<string[]>({
    queryKey: ["knowledge", "subjects"],
    queryFn: () => fetch("/api/knowledge/subjects").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (entriesLoading || subjectsLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={300} />
        <Skeleton height={320} />
      </Stack>
    );
  }

  return <KnowledgeLibrary entries={entries ?? []} subjects={subjects ?? []} />;
}
