"use client";

import { Group, Text, UnstyledButton, Tooltip } from "@mantine/core";
import { getMoodEmoji, getMoodColor } from "@/modules/journal/utils";
import { cn } from "@/core/utils";

const MOODS = ["happy", "sad", "neutral", "anxious", "stressed", "motivated", "excited"] as const;

type MoodSelectorProps = {
  value?: string;
  onChange: (mood: string) => void;
  size?: "sm" | "md" | "lg";
};

export function MoodSelector({ value, onChange, size = "md" }: MoodSelectorProps) {
  const iconSizes = { sm: 24, md: 32, lg: 40 };
  const iconSize = iconSizes[size];

  return (
    <Group gap={size === "sm" ? 4 : 8}>
      {MOODS.map((mood) => {
        const isSelected = value === mood;
        return (
          <Tooltip key={mood} label={mood.charAt(0).toUpperCase() + mood.slice(1)}>
            <UnstyledButton
              onClick={() => onChange(isSelected ? "" : mood)}
              className={cn(
                "flex items-center justify-center rounded-full transition-all duration-150",
                isSelected
                  ? "scale-110 ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900"
                  : "opacity-50 hover:opacity-80 hover:scale-105",
              )}
              style={{
                width: iconSize + 8,
                height: iconSize + 8,
                backgroundColor: isSelected ? getMoodColor(mood) : "transparent",
              }}
              aria-label={mood}
            >
              <Text style={{ fontSize: iconSize }} role="img">
                {getMoodEmoji(mood)}
              </Text>
            </UnstyledButton>
          </Tooltip>
        );
      })}
    </Group>
  );
}
