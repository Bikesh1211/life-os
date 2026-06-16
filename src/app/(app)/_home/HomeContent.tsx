"use client";

import { useEffect, useRef, useState } from "react";
import { Stack, SimpleGrid, ScrollArea, Box, Text, Kbd, Group } from "@mantine/core";
import { useComputedColorScheme } from "@mantine/core";
import { IconCommand } from "@tabler/icons-react";
import { useAppShell } from "../AppShellProvider";
import { AnimatedBackground } from "./AnimatedBackground";
import { Hero } from "./Hero";
import { TodaysFocusCard } from "./TodaysFocusCard";
import { QuickActions } from "./QuickActions";
import { TodaysAgenda } from "./TodaysAgenda";
import { LifeProgress } from "./LifeProgress";
import {
  WeatherWidget,
  MusicWidget,
  HabitSnapshot,
  MiniCalendar,
  ProductivitySnapshot,
  AiAssistant,
  MemoriesWidget,
  RecentlyOpened,
  InspirationSection,
} from "./Widgets";

export function HomeContent() {
  const { setMinimalChrome, minimalChrome } = useAppShell();
  const scheme = useComputedColorScheme();
  const isDark = scheme === "dark";
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdPaletteOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Box
      className="relative min-h-screen"
      style={{
        background: isDark ? "transparent" : undefined,
        color: isDark ? "var(--mantine-color-dark-0)" : undefined,
      }}
    >
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Cmd+K hint */}
        <Group justify="flex-end" mb="md">
          <Group gap={4} c="dimmed">
            <IconCommand size={12} />
            <Kbd style={{ fontSize: 10 }}>K</Kbd>
            <Text size="xs" c="dimmed">Open commands</Text>
          </Group>
        </Group>

        <Stack gap="xl">
          {/* Hero */}
          <Hero />

          {/* Today's Focus Card */}
          <TodaysFocusCard />

          {/* Quick Actions */}
          <QuickActions />

          {/* Two-column layout for main content */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <Stack gap="lg">
              <TodaysAgenda />
              <LifeProgress />
            </Stack>
            <Stack gap="lg">
              {/* Top row: weather + music */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <WeatherWidget />
                <MusicWidget />
              </SimpleGrid>

              {/* AI Assistant */}
              <AiAssistant />

              {/* Middle row: habits + mini calendar */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <HabitSnapshot />
                <MiniCalendar />
              </SimpleGrid>

              {/* Productivity snapshot */}
              <ProductivitySnapshot />

              {/* Bottom row: memories + recently opened */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <MemoriesWidget />
                <RecentlyOpened />
              </SimpleGrid>

              {/* Inspiration */}
              <InspirationSection />
            </Stack>
          </SimpleGrid>
        </Stack>

        {/* Footer */}
        <Text ta="center" size="xs" c="dimmed" className="mt-16 mb-8">
          Make today meaningful.
        </Text>
      </div>

      {/* Command palette overlay */}
      {cmdPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setCmdPaletteOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setCmdPaletteOpen(false)}
          />
          <div
            className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              background: isDark
                ? "var(--mantine-color-dark-7)"
                : "white",
              borderColor: isDark
                ? "var(--mantine-color-dark-4)"
                : "var(--mantine-color-gray-3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b" style={{ borderColor: isDark ? "var(--mantine-color-dark-4)" : "var(--mantine-color-gray-2)" }}>
              <TextInputShell />
            </div>
            <div className="p-2">
              {[
                { label: "Create Task", shortcut: "⌘N" },
                { label: "Open Dashboard", shortcut: "⌘D" },
                { label: "Search Notes", shortcut: "⌘⇧N" },
                { label: "Start Focus Session", shortcut: "⌘F" },
              ].map((item) => (
                <Group
                  key={item.label}
                  className="px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  justify="space-between"
                  onClick={() => setCmdPaletteOpen(false)}
                >
                  <Text size="sm">{item.label}</Text>
                  <Kbd style={{ fontSize: 10 }}>{item.shortcut}</Kbd>
                </Group>
              ))}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

function TextInputShell() {
  return (
    <div
      className="flex items-center gap-2"
      style={{ color: "var(--mantine-color-dimmed)" }}
    >
      <IconCommand size={16} />
      <span className="text-sm">Type a command or search...</span>
    </div>
  );
}