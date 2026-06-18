"use client";

import { Group, Text } from "@mantine/core";

type Props = {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function SectionHeading({ title, icon, action }: Props) {
  return (
    <Group justify="space-between" mb="md">
      <Group gap="xs">
        {icon}
        <Text fw={600} size="lg" c="white">{title}</Text>
      </Group>
      {action}
    </Group>
  );
}
