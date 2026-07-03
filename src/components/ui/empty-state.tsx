"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  icon: TablerIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Stack
        align="center"
        justify="center"
        gap="xs"
        className="py-16 px-8"
      >
        <ThemeIcon
          size={56}
          radius="xl"
          variant="light"
          color="gray"
          className="mb-1"
        >
          <Icon size={24} />
        </ThemeIcon>
        <Text fw={600} size="md" c="dimmed" ta="center">
          {title}
        </Text>
        {description && (
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            {description}
          </Text>
        )}
        {action && <div className="mt-3">{action}</div>}
      </Stack>
    </motion.div>
  );
}
