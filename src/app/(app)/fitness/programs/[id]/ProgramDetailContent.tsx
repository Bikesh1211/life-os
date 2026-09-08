"use client";

import { useRouter } from "next/navigation";
import { Stack, Group, Text, Badge, Button, Paper, Accordion, Table } from "@mantine/core";
import { IconArrowLeft, IconBarbell, IconRun } from "@tabler/icons-react";
import type { WorkoutProgram, ProgramDay, ProgramExercise } from "@/modules/fitness";

type ProgramExerciseWithName = ProgramExercise & { exerciseName: string | null };

type Props = {
  program: WorkoutProgram;
  days: (ProgramDay & { exercises: ProgramExerciseWithName[] })[];
};

export function ProgramDetailContent({ program, days }: Props) {
  const router = useRouter();

  return (
    <Stack gap="md">
      <Group>
        <Button variant="subtle" onClick={() => router.push("/fitness?tab=programs")}>
          <IconArrowLeft size={18} />
        </Button>
        <IconBarbell size={24} />
        <Text fw={700} size="xl">{program.name}</Text>
        <Badge size="sm" tt="capitalize">{program.difficulty}</Badge>
        <Badge size="sm" variant="light" tt="capitalize">{program.goal?.replace(/_/g, " ") ?? "—"}</Badge>
      </Group>

      {program.description && (
        <Text c="dimmed" size="sm">{program.description}</Text>
      )}

      <Group gap="xs">
        <Text size="sm" c="dimmed">{program.daysPerWeek} days/week</Text>
        {program.durationWeeks && (
          <Text size="sm" c="dimmed">• {program.durationWeeks} weeks</Text>
        )}
      </Group>

      <Accordion variant="separated">
        {days.map((day) => (
          <Accordion.Item key={day.id} value={day.id}>
            <Accordion.Control>
              <Group>
                <Text fw={600} size="sm">Day {day.dayNumber}: {day.name}</Text>
                <Badge size="sm" variant="light">{day.exercises.length} exercises</Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {day.exercises.length === 0 ? (
                <Text size="sm" c="dimmed">No exercises assigned yet.</Text>
              ) : (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Exercise</Table.Th>
                      <Table.Th>Sets</Table.Th>
                      <Table.Th>Reps</Table.Th>
                      <Table.Th>Weight</Table.Th>
                      <Table.Th>Rest</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {day.exercises.map((ex) => (
                      <Table.Tr key={ex.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>{ex.exerciseName ?? "Unknown"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.targetSets ?? "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.targetReps ?? "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.targetWeightKg ? `${ex.targetWeightKg} kg` : "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ex.restSeconds ?? "—"}s</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
              <Button
                size="xs"
                variant="light"
                mt="sm"
                leftSection={<IconRun size={14} />}
                onClick={() => router.push(`/fitness/workout?programDayId=${day.id}`)}
              >
                Start Workout
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {days.length === 0 && (
        <Paper withBorder p="xl" style={{ textAlign: "center" }}>
          <Text c="dimmed" size="sm">No days configured for this program yet.</Text>
        </Paper>
      )}
    </Stack>
  );
}
