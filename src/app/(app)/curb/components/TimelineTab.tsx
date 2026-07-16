"use client";

import { useState, useEffect, useCallback } from "react";
import { Paper, Text, Group, Stack, Badge, Skeleton } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

type TimelineItem = {
  id: string;
  habitId: string;
  habitName: string;
  habitIcon: string | null;
  habitColor: string | null;
  loggedAt: string;
  trigger: string | null;
  mood: string | null;
  note: string | null;
};

const MOOD_EMOJI: Record<string, string> = {
  Happy: "😊", Sad: "😢", Stress: "😰", Tired: "😴",
  Excited: "🎉", Lonely: "😔", Bored: "😐", Angry: "😠",
};

export function TimelineTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/curb/timeline?date=${date}`);
      const json = await res.json();
      setItems(json);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === today;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={700}>Timeline</Text>
        <Group gap="xs">
          <button onClick={() => changeDate(-1)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
            ← Previous
          </button>
          <Text size="sm" fw={600} className="min-w-[120px] text-center">
            {date} {isToday && "(Today)"}
          </Text>
          <button onClick={() => changeDate(1)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors" disabled={isToday}>
            Next →
          </button>
        </Group>
      </Group>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={48} radius="md" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Paper withBorder p="xl" radius="lg" ta="center">
          <Text c="dimmed" size="lg">No logs for this day</Text>
          <Text size="sm" c="dimmed">Tap + on any habit to start tracking</Text>
        </Paper>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const time = new Date(item.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const color = item.habitColor ?? "#3b82f6";
            return (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Group gap="sm">
                  <div className="rounded-lg p-1.5" style={{ background: `${color}15` }}>
                    <Text size="md">{item.habitIcon ?? "📌"}</Text>
                  </div>
                  <div className="flex-1">
                    <Group gap={4}>
                      <Text size="sm" fw={600}>{item.habitName}</Text>
                      <IconArrowRight size={12} className="text-gray-400" />
                      <Text size="sm" c="dimmed">{time}</Text>
                    </Group>
                    <Group gap="xs" mt={2}>
                      {item.trigger && <Badge size="sm" variant="light" color="blue">{item.trigger}</Badge>}
                      {item.mood && <Badge size="sm" variant="light" color="grape">{MOOD_EMOJI[item.mood] ?? item.mood}</Badge>}
                    </Group>
                    {item.note && (
                      <Text size="xs" c="dimmed" mt={2} lineClamp={1}>{item.note}</Text>
                    )}
                  </div>
                </Group>
              </Paper>
            );
          })}
        </div>
      )}
    </Stack>
  );
}
