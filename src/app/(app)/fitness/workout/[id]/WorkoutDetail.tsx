"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Stack, Group, Text, Badge, Button, Paper, SimpleGrid, Table, Skeleton } from "@mantine/core";
import { IconArrowLeft, IconBarbell, IconCheck, IconFlame } from "@tabler/icons-react";
import { apiFetch } from "@/core/api/http";

type Props = {
  sessionId: string;
};

type SessionData = {
  id: string;
  date: string;
  name: string | null;
  isCompleted: boolean;
  durationMinutes: number | null;
  mood: number | null;
  energy: number | null;
  notes: string | null;
  volume: number | null;
  sets: {
    id: string;
    exerciseName: string;
    setNumber: number;
    reps: number | null;
    weightKg: number | null;
    rpe: number | null;
    isWarmup: boolean;
    isDropSet: boolean;
    isFailure: boolean;
  }[];
};

function fetchSession(id: string): Promise<SessionData> {
  return apiFetch<SessionData>(`/api/fitness/workouts/${id}`);
}

export function WorkoutDetail({ sessionId }: Props) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["fitness", "workout", sessionId],
    queryFn: () => fetchSession(sessionId),
  });

  if (isLoading) {
    return (
      <Stack gap="md" p="lg">
        <Skeleton height={40} width={200} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack gap="md" p="lg">
        <Text c="dimmed">Workout not found.</Text>
        <Button variant="light" onClick={() => router.push("/fitness")}>Back to Fitness</Button>
      </Stack>
    );
  }

  const groupedSets = data.sets.reduce<Record<string, typeof data.sets>>((acc, set) => {
    if (!acc[set.exerciseName]) acc[set.exerciseName] = [];
    acc[set.exerciseName].push(set);
    return acc;
  }, {});

  return (
    <Stack gap="md">
      <Group>
        <Button variant="subtle" onClick={() => router.push("/fitness")}>
          <IconArrowLeft size={18} />
        </Button>
        <IconBarbell size={24} />
        <Text fw={700} size="xl">{data.name ?? "Workout"}</Text>
        {data.isCompleted ? (
          <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>Completed</Badge>
        ) : (
          <Badge color="yellow" variant="light">In Progress</Badge>
        )}
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Paper withBorder p="sm" style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">Date</Text>
          <Text fw={600}>{data.date}</Text>
        </Paper>
        <Paper withBorder p="sm" style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">Duration</Text>
          <Text fw={600}>{data.durationMinutes ? `${data.durationMinutes} min` : "—"}</Text>
        </Paper>
        <Paper withBorder p="sm" style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">Exercises</Text>
          <Text fw={600}>{Object.keys(groupedSets).length}</Text>
        </Paper>
        <Paper withBorder p="sm" style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">Volume</Text>
          <Text fw={600}>{data.volume ?? 0} kg</Text>
        </Paper>
      </SimpleGrid>

      {data.mood && (
        <Group gap="xs">
          <Text size="sm" c="dimmed">Mood:</Text>
          <Text fw={500}>{data.mood}/5</Text>
          {data.energy && (
            <>
              <Text size="sm" c="dimmed">Energy:</Text>
              <Text fw={500}>{data.energy}/5</Text>
            </>
          )}
        </Group>
      )}

      {data.notes && (
        <Paper withBorder p="sm">
          <Text size="sm">{data.notes}</Text>
        </Paper>
      )}

      {/* Sets by exercise */}
      {Object.entries(groupedSets).map(([exerciseName, sets]) => (
        <Paper key={exerciseName} withBorder p="md">
          <Text fw={600} size="sm" mb="sm">{exerciseName}</Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Set</Table.Th>
                <Table.Th>Reps</Table.Th>
                <Table.Th>Weight</Table.Th>
                <Table.Th>RPE</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sets.map((set, i: number) => (
                <Table.Tr key={set.id ?? i}>
                  <Table.Td>
                    <Text size="sm">{set.setNumber}</Text>
                    {set.isWarmup && <Badge size="xs" color="yellow">Warmup</Badge>}
                    {set.isDropSet && <Badge size="xs" color="orange">Drop</Badge>}
                    {set.isFailure && <Badge size="xs" color="red">Failure</Badge>}
                  </Table.Td>
                  <Table.Td><Text size="sm">{set.reps ?? "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{set.weightKg ? `${set.weightKg} kg` : "—"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{set.rpe ?? "—"}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {sets.length === 0 && <Text size="sm" c="dimmed">No sets recorded.</Text>}
        </Paper>
      ))}

      {Object.keys(groupedSets).length === 0 && (
        <Paper withBorder p="xl" style={{ textAlign: "center" }}>
          <Text c="dimmed">No exercises logged for this workout.</Text>
        </Paper>
      )}

      <Group justify="center">
        <Button variant="light" onClick={() => router.push("/fitness")}>
          Back to Dashboard
        </Button>
      </Group>
    </Stack>
  );
}
