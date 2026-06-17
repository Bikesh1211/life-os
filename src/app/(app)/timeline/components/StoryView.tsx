"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Stack,
  Text,
  Group,
  Badge,
  Box,
  TextInput,
  Select,
  MultiSelect,
  Button,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBook,
  IconMoodSmile,
  IconUsers,
  IconPlane,
  IconTimelineEvent,
  IconSearch,
  IconFilter,
  IconX,
  IconChevronDown,
  IconPhoto,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { StoryDay, StoryCard } from "@/modules/timeline";

dayjs.extend(relativeTime);

// ─── Source config ─────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  journal: { label: "Journal", color: "violet", icon: <IconBook size={14} /> },
  mood: { label: "Mood", color: "pink", icon: <IconMoodSmile size={14} /> },
  habit: { label: "Habits", color: "teal", icon: <IconUsers size={14} /> },
  travel: { label: "Travel", color: "orange", icon: <IconPlane size={14} /> },
  timeline: { label: "Timeline", color: "blue", icon: <IconTimelineEvent size={14} /> },
};

const SOURCE_OPTIONS = Object.entries(SOURCE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

// ─── Helpers ───────────────────────────────────────────────────────

function formatDayHeader(dateStr: string): string {
  const day = dayjs(dateStr);
  const today = dayjs().startOf("day");
  const diff = today.diff(day.startOf("day"), "day");

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return day.format("dddd");
  return day.format("MMMM D, YYYY");
}

function getSourceIcon(source: string): React.ReactNode {
  return SOURCE_CONFIG[source]?.icon ?? null;
}

function getSourceColor(source: string): string {
  return SOURCE_CONFIG[source]?.color ?? "gray";
}

// ─── Day Header ────────────────────────────────────────────────────

function DayHeader({ date, count }: { date: string; count: number }) {
  const day = dayjs(date);
  const isToday = day.isSame(dayjs(), "day");

  return (
    <Group gap="sm" mb="xs" mt="md">
      <Text
        fw={700}
        size="lg"
        c={isToday ? undefined : "dimmed"}
      >
        {formatDayHeader(date)}
      </Text>
      <Text size="xs" c="dimmed" className="tabular-nums">
        {day.format("MMM D, YYYY")}
      </Text>
      <Badge size="sm" variant="light" color="gray">
        {count}
      </Badge>
    </Group>
  );
}

// ─── Story Card ────────────────────────────────────────────────────

function StoryCardView({ card }: { card: StoryCard }) {
  const [expanded, setExpanded] = useState(false);
  const sourceCfg = SOURCE_CONFIG[card.source];
  const time = dayjs(card.timestamp).format("h:mm A");
  const isToday = dayjs(card.timestamp).isSame(dayjs(), "day");

  const typeLabel = card.type.replace(/_/g, " ");

  return (
    <Paper
      p="sm"
      radius="md"
      className="transition-all hover:shadow-sm"
      style={{ borderLeft: `3px solid var(--mantine-color-${sourceCfg?.color ?? "gray"}-5)` }}
    >
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <Box style={{ minWidth: 36 }} className="text-center">
          <Text size="xs" fw={600} className="tabular-nums" c="dimmed">
            {time}
          </Text>
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap={4} mb={2}>
            <Badge size="xs" color={sourceCfg?.color ?? "gray"} variant="light">
              {typeLabel}
            </Badge>
            <Badge size="xs" variant="outline" color={sourceCfg?.color ?? "gray"}>
              {sourceCfg?.label ?? card.source}
            </Badge>
          </Group>

          <Text fw={600} size="sm">
            {card.title}
          </Text>

          {card.description && (
            <Text size="xs" c="dimmed" mt={2} lineClamp={expanded ? undefined : 2}>
              {card.description}
            </Text>
          )}

          {Array.isArray(card.metadata.tags) && (
            <Group gap={4} mt={4}>
              {(card.metadata.tags as string[]).slice(0, 4).map((tag) => (
                <Badge key={tag} size="xs" variant="dot" color="gray">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
        </Box>

        <Stack gap={4} align="center">
          {(card.description && card.description.length > 100) && (
            <Tooltip label={expanded ? "Less" : "More"}>
              <ActionIcon variant="subtle" size="sm" onClick={() => setExpanded(!expanded)}>
                <IconChevronDown
                  size={14}
                  className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </ActionIcon>
            </Tooltip>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

// ─── Story View (main) ─────────────────────────────────────────────

type Props = {
  onCreateClick: () => void;
};

export function StoryView({ onCreateClick }: Props) {
  const [days, setDays] = useState<StoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("30");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchStory = useCallback(async () => {
    setLoading(true);
    try {
      const dateTo = dayjs().format("YYYY-MM-DD");
      const dateFrom = dayjs().subtract(Number(dateRange), "day").format("YYYY-MM-DD");
      const params = new URLSearchParams({ dateFrom, dateTo });
      if (keyword) params.set("keyword", keyword);
      if (selectedSources.length > 0) params.set("sources", selectedSources.join(","));

      const res = await fetch(`/api/timeline/story?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDays(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedSources, dateRange]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  return (
    <Stack gap="md">
      {/* Filter bar */}
      <Paper p="sm" radius="md">
        <Group gap="sm" wrap="nowrap">
          <TextInput
            placeholder="Search story..."
            leftSection={<IconSearch size={16} />}
            value={keyword}
            onChange={(e) => setKeyword(e.currentTarget.value)}
            style={{ flex: 1 }}
            size="sm"
          />
          <Select
            placeholder="Date range"
            value={dateRange}
            onChange={(v) => setDateRange(v ?? "30")}
            data={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 3 months" },
              { value: "365", label: "Last year" },
              { value: "all", label: "All time" },
            ]}
            size="sm"
            style={{ minWidth: 140 }}
          />
          <Button
            variant="light"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            leftSection={<IconFilter size={14} />}
          >
            Filters
          </Button>
        </Group>

        {filtersOpen && (
          <Box mt="sm">
            <MultiSelect
              placeholder="Filter by source"
              data={SOURCE_OPTIONS}
              value={selectedSources}
              onChange={setSelectedSources}
              size="sm"
              clearable
            />
          </Box>
        )}
      </Paper>

      {/* Story timeline */}
      {loading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <IconTimelineEvent size={48} stroke={1.5} className="mb-4 opacity-40" />
          <Text size="sm" mb="sm">
            No story entries found for this period.
          </Text>
          <Button
            variant="light"
            size="sm"
            onClick={onCreateClick}
          >
            Create Event
          </Button>
        </div>
      ) : (
        <Stack gap={0}>
          {days.map((day) => (
            <Box key={day.date}>
              <DayHeader date={day.date} count={day.cards.length} />
              <Stack gap="sm" ml="md" style={{ borderLeft: "2px solid var(--mantine-color-gray-3)" }}>
                {day.cards.map((card) => (
                  <Box key={`${card.source}-${card.id}`} ml="md">
                    <StoryCardView card={card} />
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
