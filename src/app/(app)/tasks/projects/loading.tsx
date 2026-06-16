import { Stack, Title, Group, ThemeIcon, SimpleGrid, Paper, Skeleton } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";

export default function ProjectsLoading() {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" size="lg" radius="md" color="yellow">
            <IconFolder size={20} />
          </ThemeIcon>
          <div>
            <Title order={2}>Projects</Title>
            <Skeleton height={12} width={60} />
          </div>
        </Group>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Paper key={i} withBorder p="md" radius="md">
            <Group mb="xs">
              <Skeleton height={28} width={28} radius="md" />
              <div>
                <Skeleton height={14} width={120} mb={4} />
                <Skeleton height={11} width={60} />
              </div>
            </Group>
            <Skeleton height={8} radius="xl" />
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}