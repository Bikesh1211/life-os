import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconRepeat } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function RecurringLoading() {
  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="cyan">
          <IconRepeat size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Recurring Tasks</Title>
          <Skeleton height={12} width={100} />
        </div>
      </Group>
      <TaskListSkeleton count={4} />
    </Stack>
  );
}