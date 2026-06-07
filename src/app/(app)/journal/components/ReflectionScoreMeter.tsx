"use client";

import { Stack, Text, Slider, Group } from "@mantine/core";

type ReflectionScoreMeterProps = {
  value?: number;
  onChange: (value: number) => void;
};

const LABELS = ["", "Terrible", "Rough", "Tough", "Okay", "Fine", "Decent", "Good", "Great", "Amazing", "Perfect"];

export function ReflectionScoreMeter({ value, onChange }: ReflectionScoreMeterProps) {
  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Reflection Score
        </Text>
        {value && (
          <Text size="sm" c="dimmed">
            {value}/10 — {LABELS[value]}
          </Text>
        )}
      </Group>
      <Slider
        value={value ?? 5}
        onChange={onChange}
        min={1}
        max={10}
        step={1}
        marks={[
          { value: 1, label: "1" },
          { value: 5, label: "5" },
          { value: 10, label: "10" },
        ]}
        color={value && value >= 7 ? "green" : value && value >= 4 ? "yellow" : "red"}
      />
    </Stack>
  );
}
