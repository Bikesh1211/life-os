"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Paper,
  Group,
  Text,
  Stack,
  ActionIcon,
  TextInput,
  Select,
  Badge,
  Progress,
  Box,
  useComputedColorScheme,
} from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerStopFilled,
  IconPlayerTrackNextFilled,
  IconClock,
} from "@tabler/icons-react";

type TimeCategory = { id: string; name: string; icon: string; color: string };

type TimerData = {
  timer: {
    userId: string;
    entryId: string;
    startTime: string;
    elapsedBeforePause: number;
    isPaused: boolean;
  } | null;
  entry: {
    id: string;
    title: string;
    categoryId: string | null;
  } | null;
  currentElapsedSeconds: number;
};

type TimerCardProps = {
  categories: TimeCategory[];
  onCreated: () => void;
};

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimeAuditTimerCard({ categories, onCreated }: TimerCardProps) {
  const isDark = useComputedColorScheme() === "dark";
  const [timerData, setTimerData] = useState<TimerData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch active timer on mount
  useEffect(() => {
    fetch("/api/time-audit/entries/active")
      .then((r) => r.json())
      .then((data: TimerData) => {
        setTimerData(data);
        if (data?.timer && !data.timer.isPaused) {
          setElapsed(data.currentElapsedSeconds);
        } else if (data?.timer && data.timer.isPaused) {
          setElapsed(data.currentElapsedSeconds);
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, []);

  // Live elapsed counter while running
  useEffect(() => {
    if (timerData?.timer && !timerData.timer.isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerData?.timer?.isPaused, timerData?.timer?.entryId]);

  const handleStart = useCallback(async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/time-audit/entries/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          title: title.trim(),
          categoryId: categoryId || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimerData(data);
        setElapsed(data.currentElapsedSeconds ?? 0);
        setTitle("");
        setCategoryId(null);
      }
    } finally {
      setLoading(false);
    }
  }, [title, categoryId]);

  const handleStop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/time-audit/entries/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      if (res.ok) {
        setTimerData(null);
        setElapsed(0);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }, [onCreated]);

  const handlePause = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/time-audit/entries/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pause" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimerData((prev) =>
          prev ? { ...prev, timer: { ...prev.timer!, isPaused: true } } : prev
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResume = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/time-audit/entries/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resume" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimerData(data);
        setElapsed(data.currentElapsedSeconds ?? elapsed);
      }
    } finally {
      setLoading(false);
    }
  }, [elapsed]);

  if (fetching) {
    return (
      <Paper withBorder p="md" radius="lg">
        <Group justify="center">
          <Text size="sm" c="dimmed">Loading timer...</Text>
        </Group>
      </Paper>
    );
  }

  const isRunning = timerData?.timer && !timerData.timer.isPaused;
  const isPaused = timerData?.timer?.isPaused;
  const activeEntry = timerData?.entry;

  // Running / Paused state
  if (isRunning || isPaused) {
    return (
      <Paper
        withBorder
        p="md"
        radius="lg"
        bg={isDark ? "dark.6" : isPaused ? "var(--mantine-color-yellow-0)" : "var(--mantine-color-green-0)"}
        style={isDark ? { borderColor: isPaused ? "var(--mantine-color-yellow-8)" : "var(--mantine-color-green-8)" } : undefined}
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap={6}>
              <IconClock size={18} />
              <Text fw={600} size="lg">
                {formatElapsed(elapsed)}
              </Text>
              {isPaused && (
                <Badge size="sm" variant="light" color="yellow">
                  Paused
                </Badge>
              )}
              {isRunning && (
                <Badge size="sm" variant="dot" color="green">
                  Recording
                </Badge>
              )}
            </Group>
            <Group gap={4}>
              {isRunning && (
                <ActionIcon
                  variant="light"
                  color="yellow"
                  size="lg"
                  radius="md"
                  onClick={handlePause}
                  loading={loading}
                >
                  <IconPlayerPauseFilled size={18} />
                </ActionIcon>
              )}
              {isPaused && (
                <ActionIcon
                  variant="filled"
                  color="green"
                  size="lg"
                  radius="md"
                  onClick={handleResume}
                  loading={loading}
                >
                  <IconPlayerTrackNextFilled size={18} />
                </ActionIcon>
              )}
              <ActionIcon
                variant="filled"
                color="red"
                size="lg"
                radius="md"
                onClick={handleStop}
                loading={loading}
              >
                <IconPlayerStopFilled size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {activeEntry && (
            <div>
              <Text size="sm" fw={500}>
                {activeEntry.title}
              </Text>
              {activeEntry.categoryId && (
                <Badge
                  size="sm"
                  variant="light"
                  color={
                    categories.find((c) => c.id === activeEntry.categoryId)?.color ?? "gray"
                  }
                >
                  {categories.find((c) => c.id === activeEntry.categoryId)?.name ??
                    "Unknown"}
                </Badge>
              )}
            </div>
          )}

          <Progress
            value={isPaused ? 100 : ((elapsed % 3600) / 3600) * 100}
            size="xs"
            color={isPaused ? "yellow" : "green"}
            striped={!!isRunning}
            animated={!!isRunning}
          />
        </Stack>
      </Paper>
    );
  }

  // Idle state
  return (
    <Paper withBorder p="md" radius="lg">
      <Stack gap="sm">
        <Group gap="sm" align="flex-end">
          <Box style={{ flex: 1 }}>
            <TextInput
              placeholder="Start tracking..."
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              size="md"
              variant="filled"
              styles={{ input: { fontWeight: 500 } }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleStart();
                }
              }}
            />
          </Box>
          <Select
            placeholder="Category"
            data={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={setCategoryId}
            size="sm"
            variant="filled"
            clearable
            style={{ width: 150 }}
          />
          <ActionIcon
            variant="filled"
            color={title.trim() ? "green" : "gray"}
            size="lg"
            radius="md"
            onClick={handleStart}
            loading={loading}
          >
            <IconPlayerPlayFilled size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}
