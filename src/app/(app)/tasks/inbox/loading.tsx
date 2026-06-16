import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import { TaskListSkeleton } from "@/modules/tasks/components/TaskSkeleton";

export default function InboxLoading() {
  return (
    <Stack gap="lg">
      <Group>
        <ThemeIcon variant="light" size="lg" radius="md" color="grape">
          <IconInbox size={20} />
        </ThemeIcon>
        <div>
          <Title order={2}>Inbox</Title>
          <Skeleton height={12} width={160} />
        </div>
      </Group>
      <Skeleton height={36} radius="md" />
      <TaskListSkeleton count={3} />
    </Stack>
  );
}