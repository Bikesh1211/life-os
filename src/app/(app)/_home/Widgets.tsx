"use client";

import { Paper, Text, Group, Stack, RingProgress, Badge, SimpleGrid, ThemeIcon, Box } from "@mantine/core";
import {
  IconCloud, IconSun, IconMoon, IconWind, IconDroplet,
  IconMusic, IconHeadphones, IconPlayerPlay, IconHeart,
  IconFlame, IconCheck, IconX,
  IconCalendarEvent, IconChevronRight,
  IconClock, IconTarget, IconMoodSmile, IconBolt,
  IconClockHour4,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import Link from "next/link";

export function WeatherWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <Paper
        withBorder
        p="md"
        radius="xl"
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1e3a5f 100%)",
          color: "white",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 rounded-full blur-2xl" />
        </div>
        <Stack gap={0}>
          <Group justify="space-between">
            <Text size="xs" fw={600} tt="uppercase" opacity={0.7} >
              Weather
            </Text>
            <IconCloud size={20} opacity={0.7} />
          </Group>
          <Group gap={4} mt="xs">
            <Text size="3xl" fw={700} style={{ lineHeight: 1 }}>
              72°
            </Text>
            <Text size="sm" opacity={0.8}>
              Partly Cloudy
            </Text>
          </Group>
          <Group gap="md" mt="xs" opacity={0.7}>
            <Group gap={4}>
              <IconDroplet size={12} />
              <Text size="xs">45%</Text>
            </Group>
            <Group gap={4}>
              <IconWind size={12} />
              <Text size="xs">12 mph</Text>
            </Group>
            <Group gap={4}>
              <IconSun size={12} />
              <Text size="xs">6:42 AM</Text>
            </Group>
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  );
}

export function MusicWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.95, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)",
          }}
        />
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <ThemeIcon variant="light" color="pink" size="sm" radius="md">
                <IconMusic size={14} />
              </ThemeIcon>
              <Text size="xs" fw={600} tt="uppercase"  c="dimmed">
                Music
              </Text>
            </Group>
            <Group gap={2}>
              <IconHeadphones size={14} style={{ color: "var(--mantine-color-pink-5)" }} />
              <Text size="xs" c="dimmed">Focus</Text>
            </Group>
          </Group>
          <Group gap="sm">
            <Paper
              p="xs"
              radius="md"
              style={{
                background: "var(--mantine-color-pink-light)",
                color: "var(--mantine-color-pink-filled)",
              }}
            >
              <IconPlayerPlay size={20} />
            </Paper>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600}>Lo-Fi Study Beats</Text>
              <Text size="xs" c="dimmed">Focus playlist · 12 songs</Text>
            </div>
            <IconHeart size={16} style={{ color: "var(--mantine-color-pink-5)" }} />
          </Group>
        </Stack>
      </Paper>
    </motion.div>
  );
}

export function HabitSnapshot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Group justify="space-between" mb="sm">
          <Group gap={6}>
            <ThemeIcon variant="light" color="orange" size="sm" radius="md">
              <IconFlame size={14} />
            </ThemeIcon>
            <Text size="xs" fw={600} tt="uppercase"  c="dimmed">
              Habits
            </Text>
          </Group>
          <Group gap={4}>
            <IconFlame size={16} style={{ color: "var(--mantine-color-orange-5)" }} />
            <Text size="sm" fw={700}>14</Text>
            <Text size="xs" c="dimmed">day streak</Text>
          </Group>
        </Group>
        <Group gap="xs">
          {["Meditate", "Read", "Gym", "Code", "Journal"].map((habit) => (
            <Badge
              key={habit}
              size="sm"
              variant="light"
              color={Math.random() > 0.3 ? "green" : "gray"}
              leftSection={
                Math.random() > 0.3 ? <IconCheck size={10} /> : <IconX size={10} />
              }
            >
              {habit}
            </Badge>
          ))}
        </Group>
        <RingProgress
          size={50}
          thickness={4}
          sections={[{ value: 80, color: "orange" }]}
          label={
            <Text ta="center" size="xs" fw={700}>
              80%
            </Text>
          }
          className="mt-1"
        />
      </Paper>
    </motion.div>
  );
}

export function MiniCalendar() {
  const today = dayjs();
  const startOfMonth = today.startOf("month");
  const daysInMonth = today.daysInMonth();
  const startDay = startOfMonth.day();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: startDay }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.05, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Group justify="space-between" mb="xs">
          <Group gap={6}>
            <ThemeIcon variant="light" color="blue" size="sm" radius="md">
              <IconCalendarEvent size={14} />
            </ThemeIcon>
            <Text size="xs" fw={600} tt="uppercase"  c="dimmed">
              {today.format("MMMM YYYY")}
            </Text>
          </Group>
          <IconChevronRight size={14} style={{ color: "var(--mantine-color-dimmed)" }} />
        </Group>
        <Box className="grid grid-cols-7 gap-0.5 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <Text key={d} size="xs" c="dimmed" fw={600} className="py-0.5">
              {d}
            </Text>
          ))}
          {leadingBlanks.map((i) => (
            <Box key={`blank-${i}`} />
          ))}
          {days.map((d) => (
            <Box
              key={d}
              className={`py-0.5 rounded-full text-xs ${
                d === today.date()
                  ? "bg-blue-500 text-white font-bold"
                  : "text-inherit hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {d}
            </Box>
          ))}
        </Box>
      </Paper>
    </motion.div>
  );
}

export function ProductivitySnapshot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Text size="xs" fw={600} mb="sm" tt="uppercase"  c="dimmed">
          Today&apos;s Productivity
        </Text>
        <SimpleGrid cols={2} spacing="sm">
          {[
            { label: "Focus Hours", value: "3.5h", icon: IconClock, color: "blue" },
            { label: "Tasks Done", value: "7", icon: IconCheck, color: "green" },
            { label: "Goals Progress", value: "65%", icon: IconTarget, color: "violet" },
            { label: "Mood", value: "8/10", icon: IconMoodSmile, color: "yellow" },
          ].map((stat) => (
            <Group key={stat.label} gap="xs">
              <ThemeIcon variant="light" color={stat.color} size="md" radius="md">
                <stat.icon size={14} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={700}>{stat.value}</Text>
                <Text size="xs" c="dimmed">{stat.label}</Text>
              </div>
            </Group>
          ))}
        </SimpleGrid>
      </Paper>
    </motion.div>
  );
}

export function AiAssistant() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.15, duration: 0.5 }}
    >
      <Paper
        withBorder
        p="md"
        radius="xl"
        className="relative overflow-hidden cursor-pointer group"
        component={Link}
        href="/chat"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.08]"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
          }}
        />
        <Group gap="sm">
          <div
            className="p-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            <IconBolt size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              Ask AI Assistant
            </Text>
            <Text size="xs" c="dimmed">
              Plan your day, get insights, or ask anything
            </Text>
          </div>
          <IconChevronRight size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
        </Group>
      </Paper>
    </motion.div>
  );
}

export function MemoriesWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Group gap={6} mb="sm">
          <ThemeIcon variant="light" color="pink" size="sm" radius="md">
            <IconClockHour4 size={14} />
          </ThemeIcon>
          <Text size="xs" fw={600} tt="uppercase"  c="dimmed">
            On This Day
          </Text>
        </Group>
        <Text size="sm" c="dimmed" ta="center" py="md">
          No memories from this day yet
        </Text>
      </Paper>
    </motion.div>
  );
}

export function RecentlyOpened() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.25, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Group gap={6} mb="sm">
          <ThemeIcon variant="light" color="grape" size="sm" radius="md">
            <IconClockHour4 size={14} />
          </ThemeIcon>
          <Text size="xs" fw={600} tt="uppercase"  c="dimmed">
            Recently Opened
          </Text>
        </Group>
        <Stack gap={4}>
          {[
            { label: "Portfolio Design", type: "Task", href: "/tasks" },
            { label: "React Course Notes", type: "Note", href: "/notes" },
            { label: "Weekly Review", type: "Journal", href: "/journal" },
          ].map((item) => (
            <Box
              key={item.label}
              component={Link}
              href={item.href}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <Text size="sm" style={{ flex: 1 }} lineClamp={1}>
                {item.label}
              </Text>
              <Text size="xs" c="dimmed">{item.type}</Text>
            </Box>
          ))}
        </Stack>
      </Paper>
    </motion.div>
  );
}

export function InspirationSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.5 }}
    >
      <Paper withBorder p="md" radius="xl" className="h-full">
        <Text size="xs" fw={600} mb="sm" tt="uppercase"  c="dimmed">
          Inspiration
        </Text>
        <Stack gap="xs">
          {["The Power of Atomic Habits", "Designing Your Ideal Week", "Deep Work: A Practical Guide"].map(
            (title) => (
              <Group key={title} gap="xs" className="py-1">
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: "var(--mantine-color-blue-5)" }}
                />
                <Text size="sm" lineClamp={1}>
                  {title}
                </Text>
              </Group>
            ),
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
}