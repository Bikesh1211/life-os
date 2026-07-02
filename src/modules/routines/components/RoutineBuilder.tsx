"use client";

import { useState } from "react";
import {
  Stack,
  TextInput,
  Group,
  Button,
  Select,
  Switch,
  ActionIcon,
  Paper,
  Text,
  ColorInput,
} from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconGripVertical, IconPlus } from "@tabler/icons-react";
import { useCreateRoutine } from "@/hooks/use-routines";

type ItemForm = {
  key: string;
  title: string;
  startTime: string;
  endTime: string;
  isOptional: boolean;
};

type RoutineBuilderProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Every Day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom Days" },
];

const DAY_OPTIONS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

let itemKeyCounter = 0;
function nextKey() {
  return `item_${++itemKeyCounter}`;
}

export function RoutineBuilder({ onSuccess, onCancel }: RoutineBuilderProps) {
  const createRoutine = useCreateRoutine();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [scheduleType, setScheduleType] = useState<string>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [items, setItems] = useState<ItemForm[]>([
    { key: nextKey(), title: "", startTime: "08:00", endTime: "09:00", isOptional: false },
  ]);

  function addItem() {
    const last = items[items.length - 1];
    const lastTime = last?.endTime || "09:00";
    const [h] = lastTime.split(":").map(Number);
    const nextHour = Math.min(h + 1, 23);
    const nextTime = `${String(nextHour).padStart(2, "0")}:00`;

    setItems([
      ...items,
      {
        key: nextKey(),
        title: "",
        startTime: lastTime,
        endTime: nextTime,
        isOptional: false,
      },
    ]);
  }

  function removeItem(key: string) {
    setItems(items.filter((i) => i.key !== key));
  }

  function updateItem(key: string, field: keyof ItemForm, value: string | boolean) {
    setItems(items.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  }

  async function handleSubmit() {
    if (!name.trim()) return;

    await createRoutine.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      scheduleType,
      customDays: scheduleType === "custom" ? selectedDays : undefined,
      items: items
        .filter((i) => i.title.trim())
        .map((i, idx) => ({
          title: i.title.trim(),
          startTime: i.startTime,
          endTime: i.endTime || undefined,
          order: idx,
          isOptional: i.isOptional,
        })),
    });

    notifications.show({ title: "Created", message: "Routine created", color: "green" });
    onSuccess?.();
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Routine Name"
        placeholder="e.g. Morning Routine"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />

      <Text size="sm" fw={500}>Description</Text>
      <Editor
        content={textToEditorContent(description)}
        onChange={(_json, _html, text) => setDescription(text)}
        placeholder="What is this routine for?"
        minHeight="80px"
        showToolbar={false}
      />

      <Group grow>
        <ColorInput label="Color" value={color} onChange={setColor} />
        <Select
          label="Schedule"
          data={SCHEDULE_OPTIONS}
          value={scheduleType}
          onChange={(v) => v && setScheduleType(v)}
        />
      </Group>

      {scheduleType === "custom" && (
        <Group gap={4}>
          {DAY_OPTIONS.map((day) => (
            <Button
              key={day.value}
              size="xs"
              variant={selectedDays.includes(day.value) ? "filled" : "outline"}
              onClick={() =>
                setSelectedDays((prev) =>
                  prev.includes(day.value)
                    ? prev.filter((d) => d !== day.value)
                    : [...prev, day.value],
                )
              }
            >
              {day.label}
            </Button>
          ))}
        </Group>
      )}

      <Text size="sm" fw={500}>
        Activities
      </Text>

      <Stack gap="xs">
        {items.map((item, index) => (
          <Paper key={item.key} withBorder p="xs" radius="sm">
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <ActionIcon variant="subtle" size="sm" mt={28}>
                <IconGripVertical size={14} />
              </ActionIcon>

              <Stack gap={4} className="flex-1">
                <TextInput
                  placeholder="Activity name"
                  value={item.title}
                  onChange={(e) => updateItem(item.key, "title", e.currentTarget.value)}
                  size="sm"
                />
                <Group grow>
                  <TextInput
                    label="Start"
                    type="time"
                    value={item.startTime}
                    onChange={(e) => updateItem(item.key, "startTime", e.currentTarget.value)}
                    size="xs"
                  />
                  <TextInput
                    label="End"
                    type="time"
                    value={item.endTime}
                    onChange={(e) => updateItem(item.key, "endTime", e.currentTarget.value)}
                    size="xs"
                  />
                </Group>
              </Stack>

              <Stack gap={4} align="center" mt={20}>
                <Switch
                  size="xs"
                  label="Optional"
                  checked={item.isOptional}
                  onChange={(e) => updateItem(item.key, "isOptional", e.currentTarget.checked)}
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => removeItem(item.key)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>

      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        onClick={addItem}
        size="sm"
      >
        Add Activity
      </Button>

      <Group justify="flex-end" mt="md">
        {onCancel && (
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          loading={createRoutine.isPending}
          disabled={!name.trim()}
        >
          Create Routine
        </Button>
      </Group>
    </Stack>
  );
}
