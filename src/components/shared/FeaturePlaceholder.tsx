import { Center, Stack, ThemeIcon, Text } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { IconBuildingArch } from "@tabler/icons-react";

type FeaturePlaceholderProps = {
  title: string;
  description?: string;
  icon?: TablerIcon;
};

export function FeaturePlaceholder({
  title,
  description,
  icon: Icon = IconBuildingArch,
}: FeaturePlaceholderProps) {
  return (
    <Center h="60vh">
      <Stack align="center" gap="md">
        <ThemeIcon size={80} radius="xl" variant="light" color="gray">
          <Icon size={40} />
        </ThemeIcon>
        <Text size="xl" fw={600}>
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" ta="center" maw={400}>
            {description}
          </Text>
        )}
        <Text size="xs" c="dimmed">
          Coming soon
        </Text>
      </Stack>
    </Center>
  );
}
