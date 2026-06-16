"use client";

import { Paper, Text, Group, Button, RingProgress, Tooltip, ActionIcon } from "@mantine/core";
import { IconTarget, IconEdit, IconPlayerPlay, IconCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";

export function TodaysFocusCard() {
  const focusGoal = null;

  if (!focusGoal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Paper withBorder p="lg" radius="xl" className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              background: "radial-gradient(circle at 30% 50%, #3b82f6, transparent 70%)",
            }}
          />
          <Group gap="lg" wrap="nowrap">
            <RingProgress
              size={80}
              thickness={6}
              sections={[{ value: 0, color: "blue" }]}
              label={
                <Text ta="center" size="xs" fw={700}>
                  0%
                </Text>
              }
            />
            <div style={{ flex: 1 }}>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" >
                Today&apos;s Focus
              </Text>
              <Text size="lg" fw={600} mt={2}>
                No goal set for today
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                Set a main goal to focus your day
              </Text>
            </div>
            <Button variant="light" color="blue" leftSection={<IconTarget size={16} />} radius="xl">
              Set Goal
            </Button>
          </Group>
        </Paper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Paper withBorder p="lg" radius="xl">
        <Group gap="lg" wrap="nowrap">
          <RingProgress
            size={80}
            thickness={6}
            sections={[{ value: 65, color: "blue" }]}
            label={
              <Text ta="center" size="xs" fw={700}>
                65%
              </Text>
            }
          />
          <div style={{ flex: 1 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" >
              Today&apos;s Focus
            </Text>
            <Text size="lg" fw={600} mt={2}>
              Finish Portfolio Website
            </Text>
            <Group gap="xs" mt={4}>
              <Text size="xs" c="dimmed">Est. 2h 30m</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">Remaining 45m</Text>
            </Group>
          </div>
          <Group gap={4}>
            <Tooltip label="Start focus session">
              <ActionIcon variant="filled" color="blue" size="lg" radius="xl">
                <IconPlayerPlay size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon variant="subtle" size="md" color="gray">
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Mark complete">
              <ActionIcon variant="subtle" size="md" color="green">
                <IconCheck size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Paper>
    </motion.div>
  );
}