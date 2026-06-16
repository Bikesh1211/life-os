"use client";

import { Group, Button, Text, ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";

type DayNavigationProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
};

export function DayNavigation({ selectedDate, onDateChange }: DayNavigationProps) {
  const date = dayjs(selectedDate);
  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");
  const dayName = date.format("dddd");
  const formattedDate = date.format("MMMM D, YYYY");

  const goToToday = () => onDateChange(dayjs().format("YYYY-MM-DD"));
  const goToPrev = () => onDateChange(date.subtract(1, "day").format("YYYY-MM-DD"));
  const goToNext = () => onDateChange(date.add(1, "day").format("YYYY-MM-DD"));

  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <ActionIcon variant="subtle" onClick={goToPrev} aria-label="Previous day">
          <IconChevronLeft size={18} />
        </ActionIcon>
        <div className="text-center">
          <Text size="lg" fw={600}>{dayName}</Text>
          <Text size="sm" c="dimmed">{formattedDate}</Text>
        </div>
        <ActionIcon variant="subtle" onClick={goToNext} aria-label="Next day">
          <IconChevronRight size={18} />
        </ActionIcon>
      </Group>
      {!isToday && (
        <Button
          variant="light"
          size="xs"
          leftSection={<IconCalendar size={14} />}
          onClick={goToToday}
        >
          Today
        </Button>
      )}
    </Group>
  );
}
