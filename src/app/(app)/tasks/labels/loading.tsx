import { Stack, Title, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconTags } from "@tabler/icons-react";

export default function LabelsLoading() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md" color="violet">
            <IconTags size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Labels</Title>
            <Skeleton height={12} width={60} />
          </div>
        </Group>
      </Group>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={48} radius="md" />
      ))}
    </Stack>
  );
}