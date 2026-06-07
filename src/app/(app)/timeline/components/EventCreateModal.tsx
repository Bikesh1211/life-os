"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Group,
  Button,
  Stack,
  SegmentedControl,
  ColorPicker,
  Text,
  SimpleGrid,
  Switch,
  ActionIcon,
  Tooltip,
  rem,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconUser,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconCoin,
  IconPlane,
  IconUsers,
  IconBuildingStore,
  IconPlayerPlay,
  IconStar,
  IconCalendar,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import dayjs from "dayjs";

const categoryOptions = [
  { value: "personal", label: "Personal" },
  { value: "career", label: "Career" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "finance", label: "Finance" },
  { value: "travel", label: "Travel" },
  { value: "relationships", label: "Relationships" },
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "custom", label: "Custom" },
];

const importanceOptions = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const recurrenceOptions = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const presetColors = [
  "#3b82f6",
  "#8b5cf6",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ec4899",
  "#6366f1",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
  "#78716c",
];

const iconOptions: { value: string; icon: TablerIcon }[] = [
  { value: "IconStar", icon: IconStar },
  { value: "IconHeart", icon: IconHeart },
  { value: "IconBriefcase", icon: IconBriefcase },
  { value: "IconSchool", icon: IconSchool },
  { value: "IconCoin", icon: IconCoin },
  { value: "IconPlane", icon: IconPlane },
  { value: "IconUsers", icon: IconUsers },
  { value: "IconBuildingStore", icon: IconBuildingStore },
  { value: "IconPlayerPlay", icon: IconPlayerPlay },
  { value: "IconUser", icon: IconUser },
  { value: "IconCalendar", icon: IconCalendar },
];

type Props = {
  opened: boolean;
  onClose: () => void;
  onCreated: (event: unknown) => void;
};

export function EventCreateModal({ opened, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState<string | null>(
    new Date().toISOString(),
  );
  const [category, setCategory] = useState("personal");
  const [importance, setImportance] = useState("medium");
  const [recurrence, setRecurrence] = useState("none");
  const [color, setColor] = useState(presetColors[0]);
  const [icon, setIcon] = useState("IconStar");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!eventDate) {
      setError("Date is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          eventDate: eventDate ?? new Date().toISOString(),
          category,
          importance,
          recurrence,
          color: color || undefined,
          icon: icon || undefined,
          isPinned,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create event");
      }
      const event = await res.json();
      onCreated(event);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate(new Date().toISOString());
    setCategory("personal");
    setImportance("medium");
    setRecurrence("none");
    setColor(presetColors[0]);
    setIcon("IconStar");
    setIsPinned(false);
    setError("");
  };

  const selectedCategoryIcon =
    iconOptions.find((o) => o.value === icon)?.icon ?? IconStar;
  const SelectedIcon = selectedCategoryIcon;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="New Timeline Event"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="What happened?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          data-autofocus
        />

        <Textarea
          label="Description"
          placeholder="Add details..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={2}
        />

        <DatePickerInput
          label="Event Date"
          placeholder="Pick date"
          value={eventDate}
          onChange={setEventDate}
          required
          leftSection={<IconCalendar size={16} />}
          valueFormat="MMM D, YYYY"
          clearable={false}
        />

        <Select
          label="Category"
          data={categoryOptions}
          value={category}
          onChange={(v) => setCategory(v ?? "personal")}
        />

        <SegmentedControl
          value={importance}
          onChange={setImportance}
          data={importanceOptions}
          fullWidth
        />

        <Select
          label="Recurrence"
          data={recurrenceOptions}
          value={recurrence}
          onChange={(v) => setRecurrence(v ?? "none")}
        />

        <div>
          <Text size="sm" fw={500} mb={4}>
            Color
          </Text>
          <Group gap="xs">
            {presetColors.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                className="cursor-pointer rounded-full transition-transform duration-150 hover:scale-110"
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: c,
                  borderRadius: "50%",
                  border:
                    color === c ? "2px solid var(--mantine-color-dark-9)" : "2px solid transparent",
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>
            Icon
          </Text>
          <SimpleGrid cols={6} spacing="xs">
            {iconOptions.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = icon === opt.value;
              return (
                <Tooltip key={opt.value} label={opt.value}>
                  <div
                    onClick={() => setIcon(opt.value)}
                    className="flex cursor-pointer items-center justify-center rounded-md p-2 transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--mantine-color-blue-0)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid var(--mantine-color-blue-4)"
                        : "1px solid transparent",
                    }}
                  >
                    <IconComp
                      size={20}
                      color={
                        isSelected
                          ? "var(--mantine-color-blue-6)"
                          : "var(--mantine-color-dimmed)"
                      }
                    />
                  </div>
                </Tooltip>
              );
            })}
          </SimpleGrid>
        </div>

        <Switch
          label="Pin this event"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.currentTarget.checked)}
        />

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Event
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
