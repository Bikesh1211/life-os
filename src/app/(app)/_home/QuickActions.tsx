"use client";

import { Paper, Text, SimpleGrid, Group } from "@mantine/core";
import {
  IconPlus, IconPencil, IconTarget, IconCalendarEvent,
  IconMusic, IconClock, IconCamera, IconCoin,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";

const actions = [
  { label: "New Task", icon: IconPlus, color: "blue", href: "/tasks" },
  { label: "New Note", icon: IconPencil, color: "grape", href: "/notes" },
  { label: "New Goal", icon: IconTarget, color: "green", href: "/goals" },
  { label: "Schedule Event", icon: IconCalendarEvent, color: "orange", href: "/calendar" },
  { label: "Focus Music", icon: IconMusic, color: "pink", href: "/music" },
  { label: "Pomodoro", icon: IconClock, color: "cyan", href: "/tasks/focus-mode" },
  { label: "Add Memory", icon: IconCamera, color: "yellow", href: "/timeline" },
  { label: "Add Expense", icon: IconCoin, color: "red", href: "/finance/dashboard" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Text size="sm" fw={600} mb="sm" tt="uppercase"  c="dimmed">
        Quick Actions
      </Text>
      <SimpleGrid cols={{ base: 2, sm: 4, md: 8 }} spacing="sm">
        {actions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.04, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Paper
              component={Link}
              href={action.href}
              withBorder
              p="sm"
              radius="lg"
              className="cursor-pointer group"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Group gap="xs" justify="center" style={{ flexDirection: "column" }}>
                <div
                  className="p-2 rounded-xl transition-all duration-200 group-hover:scale-110"
                  style={{
                    background: `var(--mantine-color-${action.color}-light)`,
                    color: `var(--mantine-color-${action.color}-filled)`,
                  }}
                >
                  <action.icon size={20} />
                </div>
                <Text size="xs" ta="center" fw={500} lineClamp={1}>
                  {action.label}
                </Text>
              </Group>
            </Paper>
          </motion.div>
        ))}
      </SimpleGrid>
    </motion.div>
  );
}