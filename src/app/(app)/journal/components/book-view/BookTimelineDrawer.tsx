"use client";

import { useEffect, useRef } from "react";
import { Stack, Text, Group, Box, ScrollArea, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

type CoverageEntry = { year: number; month: number };

type BookTimelineDrawerProps = {
  open: boolean;
  coverage: CoverageEntry[];
  onClose: () => void;
  onJumpToDate: (year: number, month: number) => void;
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function BookTimelineDrawer({ open, coverage, onClose, onJumpToDate }: BookTimelineDrawerProps) {
  const yearsMap = new Map<number, number[]>();
  for (const { year, month } of coverage) {
    const months = yearsMap.get(year) ?? [];
    if (!months.includes(month)) months.push(month);
    yearsMap.set(year, months);
  }
  const years = Array.from(yearsMap.entries()).sort(([a], [b]) => b - a);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-72 border-r border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <Text size="sm" fw={600}>
                Timeline
              </Text>
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose}>
                <IconX size={16} />
              </ActionIcon>
            </div>
            <ScrollArea h="calc(100vh - 52px)">
              <Stack gap={0} px="md" py="sm">
                {years.map(([year, months]) => (
                  <div key={year} className="mb-3">
                    <Text size="sm" fw={600} c="dimmed" className="mb-1">
                      {year}
                    </Text>
                    <Group gap={4}>
                      {months.map((month) => (
                        <Box
                          key={month}
                          component="button"
                          className="rounded px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => onJumpToDate(year, month)}
                        >
                          {MONTH_NAMES[month - 1]}
                        </Box>
                      ))}
                    </Group>
                  </div>
                ))}
                {years.length === 0 && (
                  <Text size="xs" c="dimmed" ta="center" py="xl">
                    No entries yet
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
