import { Stack, Title, Text, Group, ThemeIcon, SimpleGrid, Paper, Skeleton } from "@mantine/core";
import { IconChecklist } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function TasksLoading() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md">
            <IconChecklist size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>My Tasks</Title>
            <Text size="sm" c="dimmed"><Skeleton height={12} width={60} /></Text>
          </div>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={i} withBorder p="sm" radius="md">
            <Group>
              <Skeleton height={28} width={28} radius="md" />
              <div>
                <Skeleton height={10} width={40} mb={4} />
                <Skeleton height={20} width={20} />
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Skeleton height={36} radius="md" />

      <TaskListSkeleton count={5} />
    </Stack>
  );
}