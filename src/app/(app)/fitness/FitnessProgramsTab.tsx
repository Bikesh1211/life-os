"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Stack, Group, Text, SimpleGrid, Button, Paper, Badge, Modal, TextInput,
  NumberInput, Select, Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconBarbell, IconTrash, IconEye } from "@tabler/icons-react";
import { PremiumCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/core/api/http";

async function fetchPrograms() {
  return apiFetch("/api/fitness/programs");
}

async function createProgram(body: Record<string, unknown>) {
  return apiFetch("/api/fitness/programs", { method: "POST", body: JSON.stringify(body) });
}

async function deleteProgram(id: string) {
  return apiFetch(`/api/fitness/programs/${id}`, { method: "DELETE" });
}

export function FitnessProgramsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    daysPerWeek: 3,
    durationWeeks: 8,
    difficulty: "beginner",
    goal: "general",
  });

  const { data: programs, isLoading } = useQuery({
    queryKey: ["fitness", "programs"],
    queryFn: fetchPrograms,
  });

  const createMutation = useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", "programs"] });
      close();
      setForm({ name: "", description: "", daysPerWeek: 3, durationWeeks: 8, difficulty: "beginner", goal: "general" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fitness", "programs"] }),
  });

  return (
    <Stack gap="md">
      <PageHeader
        title="Workout Programs"
        subtitle="Create and manage your training programs"
      >
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          New Program
        </Button>
      </PageHeader>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={180} radius="md" />
          ))}
        </SimpleGrid>
      ) : !programs || programs.length === 0 ? (
        <PremiumCard variant="gradient" gradient={{ from: "#22c55e", to: "#16a34a" }} padding="lg">
          <Text fw={600} size="lg" c="white">No Programs Yet</Text>
          <Text size="sm" c="white" opacity={0.8} mb="md">
            Create a structured workout program to organize your training.
          </Text>
          <Button variant="white" onClick={open}>Create Program</Button>
        </PremiumCard>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
          {programs.map((program: {
            id: string; name: string; description?: string; difficulty: string;
            daysPerWeek: number; durationWeeks?: number; goal: string;
            isActive: boolean;
          }) => (
            <PremiumCard
              key={program.id}
              variant="interactive"
              padding="md"
              motionProps={{ onClick: () => router.push(`/fitness/programs/${program.id}`) }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm">{program.name}</Text>
                {program.isActive ? (
                  <Badge size="sm" color="green" variant="light">Active</Badge>
                ) : (
                  <Badge size="sm" color="gray" variant="light">Paused</Badge>
                )}
              </Group>
              {program.description && (
                <Text size="xs" c="dimmed" lineClamp={2} mb="sm">{program.description}</Text>
              )}
              <Group gap="xs">
                <Badge size="sm" variant="outline" tt="capitalize">{program.difficulty}</Badge>
                <Badge size="sm" variant="outline">{program.daysPerWeek}d/wk</Badge>
                {program.durationWeeks && (
                  <Badge size="sm" variant="outline">{program.durationWeeks}wk</Badge>
                )}
                <Badge size="sm" variant="outline" color="blue" tt="capitalize">
                  {program.goal.replace(/_/g, " ")}
                </Badge>
              </Group>
            </PremiumCard>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={close} title="Create Workout Program" centered size="md">
        <Stack gap="md">
          <TextInput
            label="Program Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
            required
          />
          <TextInput
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
          />
          <NumberInput
            label="Days Per Week"
            value={form.daysPerWeek}
            onChange={(v) => setForm({ ...form, daysPerWeek: Number(v) })}
            min={1}
            max={7}
            required
          />
          <NumberInput
            label="Duration (weeks)"
            value={form.durationWeeks}
            onChange={(v) => setForm({ ...form, durationWeeks: Number(v) })}
            min={1}
            max={52}
          />
          <Select
            label="Difficulty"
            value={form.difficulty}
            onChange={(v) => setForm({ ...form, difficulty: v ?? "beginner" })}
            data={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
          <Select
            label="Goal"
            value={form.goal}
            onChange={(v) => setForm({ ...form, goal: v ?? "general" })}
            data={[
              { value: "general", label: "General Fitness" },
              { value: "build_muscle", label: "Build Muscle" },
              { value: "lose_fat", label: "Lose Fat" },
              { value: "endurance", label: "Endurance" },
              { value: "maintain", label: "Maintain" },
            ]}
          />
          <Button
            onClick={() => createMutation.mutate(form)}
            loading={createMutation.isPending}
            disabled={!form.name}
          >
            Create Program
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
