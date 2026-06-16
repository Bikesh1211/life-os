import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function TodayLoading() {
  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="blue">
          <IconCalendarDue size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Today</Title>
          <Skeleton height={12} width={120} />
        </div>
      </Group>
      <Skeleton height={36} radius="md" />
      <TaskListSkeleton count={3} />
    </Stack>
  );
}