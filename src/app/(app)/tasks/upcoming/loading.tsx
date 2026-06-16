import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconCalendarDue } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function UpcomingLoading() {
  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="teal">
          <IconCalendarDue size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Upcoming</Title>
          <Skeleton height={12} width={160} />
        </div>
      </Group>
      <TaskListSkeleton count={6} />
    </Stack>
  );
}