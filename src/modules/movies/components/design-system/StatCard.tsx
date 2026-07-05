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
    <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-all hover:shadow-md">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        <Box c="dimmed">{icon}</Box>
      </Group>
      <Text size="xl" fw={700} c="white">{value}</Text>
      {trend && <Text size="xs" c={trend.positive ? "green" : "red"} mt={2}>{trend.value}</Text>}
    </motion.div>
  );
}
