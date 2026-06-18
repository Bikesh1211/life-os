"use client";

import { motion } from "framer-motion";
import { Text, Group, Box } from "@mantine/core";

type Props = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
};

export function StatCard({ label, value, icon, trend }: Props) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-body,#0a0a0f)] p-4 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        <Box c="dimmed">{icon}</Box>
      </Group>
      <Text size="xl" fw={700} c="white">{value}</Text>
      {trend && <Text size="xs" c={trend.positive ? "green" : "red"} mt={2}>{trend.value}</Text>}
    </motion.div>
  );
}
