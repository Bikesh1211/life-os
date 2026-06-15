"use client";

import { useMemo } from "react";
import { Paper, Text, Tooltip as MantineTooltip } from "@mantine/core";
import type { HeatmapData } from "@/hooks/use-habit-analytics";

type Props = {
  data: HeatmapData;
};

function getColor(count: number, max: number): string {
  if (count === 0) return "bg-[var(--mantine-color-dark-6,#1a1b1e)]";
  const intensity = count / Math.max(max, 1);
  if (intensity > 0.75) return "bg-green-500";
  if (intensity > 0.5) return "bg-green-400";
  if (intensity > 0.25) return "bg-green-300";
  return "bg-green-200";
}

export function HabitHeatmap({ data }: Props) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  const weeks = useMemo(() => {
    const result: Array<Array<{ date: string; count: number }>> = [];
    let currentWeek: Array<{ date: string; count: number }> = [];
    for (const d of data) {
      const day = new Date(d.date).getDay();
      if (day === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(d);
    }
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [data]);

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} size="sm" mb="sm">
        Activity Heatmap
      </Text>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pr-2 pt-2">
            {dayLabels.map((label) => (
              <div key={label} className="h-3 text-[10px] text-[var(--mantine-color-dimmed,#5c5f66)]">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <MantineTooltip
                    key={day.date}
                    label={`${day.date}: ${day.count} completions`}
                    withArrow
                    openDelay={300}
                  >
                    <div
                      className={`h-3 w-3 rounded-sm cursor-pointer ${getColor(day.count, maxCount)}`}
                    />
                  </MantineTooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="h-3 w-3 rounded-sm bg-green-200" />
        <div className="h-3 w-3 rounded-sm bg-green-300" />
        <div className="h-3 w-3 rounded-sm bg-green-400" />
        <div className="h-3 w-3 rounded-sm bg-green-500" />
        <span>More</span>
      </div>
    </Paper>
  );
}
