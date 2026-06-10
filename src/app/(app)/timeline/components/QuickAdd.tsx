"use client";

import { useState, useRef, useCallback } from "react";
import {
  Paper,
  TextInput,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Collapse,
  Stack,
  Chip,
  Box,
} from "@mantine/core";
import {
  IconArrowRight,
  IconPlus,
  IconX,
  IconClock,
  IconMoodSmile,
  IconBolt,
  IconMapPin,
} from "@tabler/icons-react";
import { ACTIVITY_TYPE_SUGGESTIONS, CATEGORY_ICONS } from "@/modules/timeline/constants";
import dayjs from "dayjs";

type QuickAddProps = {
  onCreated: () => void;
};

function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  if (/\b(eat|food|breakfast|lunch|dinner|snack|coffee|tea|restaurant|cook|meal)\b/.test(lower)) return "food";
  if (/\b(walk|run|gym|cycle|yoga|sport|workout|exercise|fitness|stretch|hike)\b/.test(lower)) return "health";
  if (/\b(code|meeting|work|project|sprint|email|office|standup|review|deploy)\b/.test(lower)) return "career";
  if (/\b(read|study|learn|course|tutorial|lesson|practice|exam|book|article)\b/.test(lower)) return "education";
  if (/\b(movie|tv|show|series|game|gaming|music|song|film|watch|netflix|anime)\b/.test(lower)) return "entertainment";
  if (/\b(shop|buy|purchase|grocery|mall|store|amazon)\b/.test(lower)) return "finance";
  if (/\b(drive|travel|flight|train|bus|road|trip|vacation)\b/.test(lower)) return "travel";
  if (/\b(friend|family|call|date|party|social|network|meet|hangout)\b/.test(lower)) return "relationships";
  if (/\b(clean|cook|laundry|shower|bath|groom|haircut|nap|sleep|rest|chore|errand)\b/.test(lower)) return "personal";
  return "personal";
}

export function QuickAdd({ onCreated }: QuickAddProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState("");
  const [startTime, setStartTime] = useState(dayjs().format("HH:mm"));
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inferredCategory = title ? inferCategory(title) : "personal";
  const suggestions = ACTIVITY_TYPE_SUGGESTIONS[inferredCategory] ?? [];

  const handleQuickCreate = useCallback(async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const cat = inferredCategory === "food" ? "personal" : inferredCategory;
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          eventDate: new Date().toISOString(),
          category: cat,
          activityType: activityType || undefined,
          startTime: startTime || undefined,
          mood: mood ?? undefined,
          energy: energy ?? undefined,
          location: location.trim() || undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        setActivityType("");
        setMood(null);
        setEnergy(null);
        setLocation("");
        setExpanded(false);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  }, [title, activityType, startTime, mood, energy, location, inferredCategory, onCreated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickCreate();
    }
  };

  if (!expanded) {
    return (
      <Paper
        p="sm"
        radius="md"
        className="cursor-pointer transition-all hover:shadow-sm"
        style={{ border: "1px dashed var(--mantine-color-gray-4)" }}
        onClick={() => {
          setExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <Group gap="sm">
          <IconPlus size={18} className="text-gray-400" />
          <Text size="sm" c="dimmed">
            What did you do?
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group gap="sm" align="flex-start">
          <Box style={{ flex: 1 }}>
            <TextInput
              ref={inputRef}
              placeholder="e.g. Ate Chowmein, Walked 2km, Read 20 pages..."
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              variant="unstyled"
              size="xl"
              styles={{ input: { fontWeight: 500 } }}
              autoFocus
            />
            {title && (
              <Group gap={4} mt={4}>
                <Text size="xs" c="dimmed" tt="capitalize">
                  {inferredCategory}
                </Text>
                {activityType && (
                  <>
                    <Text size="xs" c="dimmed">·</Text>
                    <Text size="xs" c="dimmed">{activityType}</Text>
                  </>
                )}
              </Group>
            )}
          </Box>
          <Group gap={4}>
            <ActionIcon
              variant="filled"
              color={title.trim() ? "blue" : "gray"}
              size="lg"
              radius="md"
              onClick={handleQuickCreate}
              loading={loading}
            >
              <IconArrowRight size={20} />
            </ActionIcon>
            <ActionIcon variant="subtle" size="lg" onClick={() => setExpanded(false)}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>

        <Collapse in={!!title}>
          <Stack gap="xs">
            {suggestions.length > 0 && (
              <Group gap={4}>
                {suggestions.slice(0, 6).map((s) => (
                  <Chip
                    key={s}
                    size="xs"
                    checked={activityType === s}
                    onChange={() => setActivityType(s === activityType ? "" : s)}
                    variant="light"
                  >
                    {s}
                  </Chip>
                ))}
              </Group>
            )}

            <Group gap="sm">
              <Tooltip label="Time">
                <Group gap={4}>
                  <IconClock size={14} className="text-gray-400" />
                  <TextInput
                    value={startTime}
                    onChange={(e) => setStartTime(e.currentTarget.value)}
                    size="xs"
                    variant="filled"
                    style={{ width: 70 }}
                  />
                </Group>
              </Tooltip>

              <Tooltip label="Mood">
                <Group gap={2}>
                  <IconMoodSmile size={14} className="text-gray-400" />
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Chip
                      key={v}
                      size="xs"
                      checked={mood === v}
                      onChange={() => setMood(mood === v ? null : v)}
                      variant="light"
                      color={v >= 4 ? "green" : v === 3 ? "yellow" : "red"}
                    >
                      {v}
                    </Chip>
                  ))}
                </Group>
              </Tooltip>

              <Tooltip label="Energy">
                <Group gap={2}>
                  <IconBolt size={14} className="text-gray-400" />
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Chip
                      key={v}
                      size="xs"
                      checked={energy === v}
                      onChange={() => setEnergy(energy === v ? null : v)}
                      variant="light"
                      color={v >= 4 ? "blue" : v === 3 ? "cyan" : "gray"}
                    >
                      {v}
                    </Chip>
                  ))}
                </Group>
              </Tooltip>

              <Tooltip label="Location">
                <Group gap={4}>
                  <IconMapPin size={14} className="text-gray-400" />
                  <TextInput
                    placeholder="Where?"
                    value={location}
                    onChange={(e) => setLocation(e.currentTarget.value)}
                    size="xs"
                    variant="filled"
                    style={{ width: 100 }}
                  />
                </Group>
              </Tooltip>
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}
