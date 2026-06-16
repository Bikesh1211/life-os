"use client";

import { useState, useRef } from "react";
import { TextInput, ActionIcon, Paper, Group, Collapse, Select, Text } from "@mantine/core";
import { IconPlus, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useCreateAdhocItem } from "@/hooks/use-day-plan";
import dayjs from "dayjs";

type QuickAddBarProps = {
  date: string;
  onItemCreated: () => void;
};

const CATEGORIES = [
  "personal", "career", "education", "health", "finance",
  "travel", "relationships", "business", "entertainment", "custom",
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TIME_PRESETS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "21:00", label: "9:00 PM" },
];

export function QuickAddBar({ date, onItemCreated }: QuickAddBarProps) {
  const [title, setTitle] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [startTime, setStartTime] = useState(dayjs().format("HH:mm"));
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>("medium");
  const [location, setLocation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createItem = useCreateAdhocItem();

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || createItem.isPending) return;

    try {
      await createItem.mutateAsync({
        title: trimmed,
        startTime: startTime || dayjs().format("HH:mm"),
        endTime: endTime || undefined,
        date,
        category: category ?? undefined,
        priority: priority ?? undefined,
        location: location || undefined,
      });
      setTitle("");
      setEndTime("");
      setCategory(null);
      setLocation("");
      setShowDetails(false);
      onItemCreated();
      inputRef.current?.focus();
    } catch {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && title.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="xs" wrap="nowrap">
        <TextInput
          ref={inputRef}
          placeholder='Add an activity... e.g., "Meeting with John 2pm"'
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          variant="unstyled"
          size="sm"
          styles={{ input: { background: "transparent" } }}
        />
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          aria-label="Toggle details"
        >
          {showDetails ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </ActionIcon>
        <ActionIcon
          variant="filled"
          color="blue"
          size="sm"
          onClick={handleSubmit}
          loading={createItem.isPending}
          aria-label="Add activity"
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>

      <Collapse in={showDetails}>
        <Group gap="xs" mt="xs" wrap="wrap">
          <Select
            data={TIME_PRESETS}
            value={startTime}
            onChange={(v) => setStartTime(v ?? "09:00")}
            size="xs"
            className="w-28"
            searchable
            placeholder="Start time"
          />
          <Select
            data={TIME_PRESETS}
            value={endTime || null}
            onChange={(v) => setEndTime(v ?? "")}
            size="xs"
            className="w-28"
            searchable
            clearable
            placeholder="End time"
          />
          <Select
            data={CATEGORIES}
            value={category}
            onChange={setCategory}
            size="xs"
            className="w-32"
            searchable
            clearable
            placeholder="Category"
          />
          <Select
            data={PRIORITIES}
            value={priority}
            onChange={setPriority}
            size="xs"
            className="w-28"
            clearable
            placeholder="Priority"
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            size="xs"
            className="w-32"
          />
        </Group>
      </Collapse>
    </Paper>
  );
}
