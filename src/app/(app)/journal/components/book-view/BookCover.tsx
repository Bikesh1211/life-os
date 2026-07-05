"use client";

import { Text } from "@mantine/core";

type BookCoverProps = {
  totalEntries: number;
  yearRange: string;
  handwritten?: boolean;
};

export function BookCover({ totalEntries, yearRange, handwritten }: BookCoverProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className={`max-w-md ${handwritten ? "font-handwritten" : ""}`}>
        <Text size="xl" fw={700} c="dimmed" className="tracking-widest uppercase">
          My Journal
        </Text>
        <div className="mx-auto my-6 h-px w-16 bg-gray-300 dark:bg-gray-600" />
        <Text size="sm" c="dimmed">
          A collection of thoughts, memories, and reflections
        </Text>
        <div className="mt-6 space-y-1">
          <Text size="xs" c="dimmed">
            {totalEntries} entries
          </Text>
          <Text size="xs" c="dimmed">
            {yearRange}
          </Text>
        </div>
      </div>
    </div>
  );
}
