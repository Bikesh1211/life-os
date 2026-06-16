import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function ProjectDetailLoading() {
  return (
    <Stack gap="lg">
      <Group>
        <Skeleton height={28} width={28} radius="md" />
        <ThemeIcon variant="light" size="lg" radius="md" color="blue">
          <IconFolder size={20} />
        </ThemeIcon>
        <div>
          <Skeleton height={22} width={160} mb={4} />
          <Skeleton height={12} width={60} />
        </div>
      </Group>
      <Skeleton height={36} radius="md" />
      <TaskListSkeleton count={4} />
    </Stack>
  );
}