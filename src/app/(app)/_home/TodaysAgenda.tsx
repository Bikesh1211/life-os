"use client";

import { Paper, Text, Group, Stack, Box, Badge } from "@mantine/core";
import {
  IconSun, IconCloud, IconMoon, IconMoonStars,
  IconDots,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useTasks } from "@/modules/tasks/hooks";

const timeBlocks = [
  { label: "Morning", icon: IconSun, range: "6:00 – 12:00", color: "orange" },
  { label: "Afternoon", icon: IconCloud, range: "12:00 – 17:00", color: "yellow" },
  { label: "Evening", icon: IconMoon, range: "17:00 – 21:00", color: "blue" },
  { label: "Night", icon: IconMoonStars, range: "21:00 – 6:00", color: "violet" },
];

export function TodaysAgenda() {
  const { data: tasks, isLoading } = useTasks({
    dueDateFrom: dayjs().startOf("day").toISOString(),
    dueDateTo: dayjs().endOf("day").toISOString(),
    status: "active",
    sortBy: "dueDate",
    sortOrder: "asc",
    limit: 10,
  });

  const getTimeBlock = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const hour = dayjs(date).hour();
    if (hour < 12) return 0;
    if (hour < 17) return 1;
    if (hour < 21) return 2;
    return 3;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Text size="sm" fw={600} mb="sm" tt="uppercase"  c="dimmed">
        Today&apos;s Agenda
      </Text>
      <Paper withBorder p="md" radius="xl">
        <Stack gap={0}>
          {timeBlocks.map((block, bi) => {
            const BlockIcon = block.icon;
            const blockTasks = tasks?.filter((t) => getTimeBlock(t.dueDate) === bi) ?? [];

            return (
              <div key={block.label}>
                <Group gap="sm" py="sm">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{
                      background: `var(--mantine-color-${block.color}-light)`,
                      color: `var(--mantine-color-${block.color}-filled)`,
                    }}
                  >
                    <BlockIcon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={600}>{block.label}</Text>
                    <Text size="xs" c="dimmed">{block.range}</Text>
                  </div>
                  {blockTasks.length > 0 && (
                    <Badge size="sm" variant="light" color={block.color}>
                      {blockTasks.length}
                    </Badge>
                  )}
                </Group>

                {blockTasks.length > 0 && (
                  <Stack gap={4} ml={36} mb="sm">
                    {blockTasks.map((task) => (
                      <Group key={task.id} gap="xs">
                        <Box
                          w={6}
                          h={6}
                          style={{
                            borderRadius: "50%",
                            background: "var(--mantine-color-blue-5)",
                            flexShrink: 0,
                          }}
                        />
                        <Text size="sm" lineClamp={1}>
                          {task.title}
                        </Text>
                        {task.dueDate && (
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                            {dayjs(task.dueDate).format("HH:mm")}
                          </Text>
                        )}
                      </Group>
                    ))}
                  </Stack>
                )}

                {bi < timeBlocks.length - 1 && (
                  <Box
                    h={1}
                    style={{
                      background: "var(--mantine-color-default-border)",
                      marginLeft: 36,
                    }}
                  />
                )}
              </div>
            );
          })}

          {(!tasks || tasks.length === 0) && !isLoading && (
            <Group gap="xs" py="md" justify="center" c="dimmed">
              <IconDots size={16} />
              <Text size="sm">No tasks scheduled today</Text>
            </Group>
          )}

          {isLoading && (
            <Group gap="xs" py="md" justify="center" c="dimmed">
              <Text size="sm">Loading...</Text>
            </Group>
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
}