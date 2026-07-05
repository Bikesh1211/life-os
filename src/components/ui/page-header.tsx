"use client";

import { Group, Text, Stack } from "@mantine/core";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/core/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <Group
        justify="space-between"
        align="flex-start"
        className={cn("mb-6", className)}
        wrap="wrap"
        gap="md"
      >
        <Stack gap={2}>
          <Text
            fw={700}
            className="text-2xl tracking-tight text-gray-900 dark:text-white"
          >
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" c="dimmed" component="span">
              {subtitle}
            </Text>
          )}
        </Stack>
        {children && (
          <Group gap="sm" wrap="wrap">
            {children}
          </Group>
        )}
      </Group>
    </motion.div>
  );
}
