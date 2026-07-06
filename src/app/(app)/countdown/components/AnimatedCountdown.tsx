"use client";

import { useState, useEffect } from "react";
import { Group, Stack, Text } from "@mantine/core";

type Props = {
  targetDate: Date | string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
};

type TimeUnit = { value: number; label: string };

function computeUnits(target: Date | string): TimeUnit[] {
  const date = target instanceof Date ? target : new Date(target);
  const now = new Date();
  const diff = Math.max(0, date.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];
}

const sizeMap = {
  sm: { value: "text-2xl", label: "text-xs" },
  md: { value: "text-4xl", label: "text-sm" },
  lg: { value: "text-6xl", label: "text-base" },
};

export function AnimatedCountdown({ targetDate, size = "md", showLabels = true }: Props) {
  const [units, setUnits] = useState<TimeUnit[]>([]);

  useEffect(() => {
    setUnits(computeUnits(targetDate));
    const interval = setInterval(() => {
      setUnits(computeUnits(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (units.length === 0) return null;

  const hasDays = units[0].value > 0;

  return (
    <Group gap={hasDays ? "md" : "sm"} justify="center" wrap="nowrap">
      {units.map((unit, i) => {
        const dim = (i === 0 && !hasDays) || (i === 0 && !hasDays);
        return (
          <Stack key={unit.label} gap={0} align="center" style={{ minWidth: size === "lg" ? 80 : size === "md" ? 60 : 40 }}>
            <Text
              className={`${sizeMap[size].value} font-bold tabular-nums tracking-tight`}
              c={unit.value === 0 ? "dimmed" : undefined}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {String(unit.value).padStart(2, "0")}
            </Text>
            {showLabels && (
              <Text size="xs" c="dimmed" className={sizeMap[size].label}>
                {unit.label}
              </Text>
            )}
          </Stack>
        );
      })}
    </Group>
  );
}
