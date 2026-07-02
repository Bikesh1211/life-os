"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Paper,
  ActionIcon,
  Switch,
  Modal,
  TextInput,
  ColorInput,
  Select,
  SimpleGrid,
} from "@mantine/core";
import { Editor } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconCopy,
  IconPlayerPlay,
  IconSquareCheck,
  IconRepeat,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useDuplicateRoutine,
  useToggleRoutineActive,
} from "@/hooks/use-routines";

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Every Day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom Days" },
];

export default function RoutineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: routine, isLoading } = useRoutine(id);
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();
  const duplicateRoutine = useDuplicateRoutine();
  const toggleActive = useToggleRoutineActive();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("daily");

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--mantine-color-dark-6)]" />
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6)]" />
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <Text c="dimmed">Routine not found</Text>
        <Button component={Link} href="/routines" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Routines
        </Button>
      </div>
    );
  }

  async function handleSave() {
    await updateRoutine.mutateAsync({
      id,
      name: name || undefined,
      description: description || undefined,
      color: color || undefined,
      scheduleType: scheduleType as any,
    });
    setEditing(false);
    notifications.show({ title: "Saved", message: "Routine updated", color: "green" });
  }

  async function handleDelete() {
    if (!confirm("Delete this routine?")) return;
    await deleteRoutine.mutateAsync(id);
    notifications.show({ title: "Deleted", message: "Routine deleted", color: "orange" });
    router.push("/routines");
  }

  async function handleDuplicate() {
    await duplicateRoutine.mutateAsync(id);
    notifications.show({ title: "Duplicated", message: "Routine duplicated", color: "green" });
  }

  async function handleToggle() {
    if (!routine) return;
    await toggleActive.mutateAsync({ id, isActive: !routine.isActive });
    notifications.show({ title: routine.isActive ? "Paused" : "Activated", message: `Routine ${routine.isActive ? "paused" : "activated"}`, color: "blue" });
  }

  const sortedItems = [...(routine.items ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Group mb="md">
          <ActionIcon variant="subtle" component={Link} href="/routines">
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600}>Routines</Text>
        </Group>

        {!editing ? (
          <Stack gap="md">
            <div className="flex items-start justify-between">
              <div>
                <Group gap="sm">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: routine.color ?? "#3b82f6" }}
                  />
                  <h1 className="text-2xl font-bold">{routine.name}</h1>
                  <Badge color={routine.isActive ? "green" : "gray"} variant="light">
                    {routine.isActive ? "Active" : "Paused"}
                  </Badge>
                </Group>
                {routine.description && (
                  <Text c="dimmed" size="sm" mt={4}>
                    {routine.description}
                  </Text>
                )}
                <Group gap="xs" mt={8}>
                  <Badge size="sm" variant="outline">
                    {routine.scheduleType === "daily"
                      ? "Every Day"
                      : routine.scheduleType === "weekdays"
                        ? "Weekdays"
                        : routine.scheduleType === "weekends"
                          ? "Weekends"
                          : `Custom: ${(routine.customDays ?? []).join(", ")}`}
                  </Badge>
                  <Badge size="sm" variant="outline" color="blue">
                    {routine.items?.length ?? 0} activities
                  </Badge>
                </Group>
              </div>

              <Group gap={4}>
                <Button variant="light" size="xs" leftSection={<IconEdit size={14} />} onClick={() => { setName(routine.name); setDescription(routine.description ?? ""); setColor(routine.color ?? ""); setScheduleType(routine.scheduleType); setEditing(true); }}>
                  Edit
                </Button>
                <Button variant="light" size="xs" leftSection={<IconCopy size={14} />} onClick={handleDuplicate}>
                  Duplicate
                </Button>
                <Button variant="light" size="xs" color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>
                  Delete
                </Button>
              </Group>
            </div>

            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" mb="md">
                <Text fw={600} size="sm">
                  Daily Schedule
                </Text>
                <Group gap={4}>
                  <Text size="xs" c="dimmed">
                    Active
                  </Text>
                  <Switch size="sm" checked={routine.isActive} onChange={handleToggle} />
                </Group>
              </Group>

              <Stack gap={0}>
                {sortedItems.map((item, idx) => (
                  <Group
                    key={item.id}
                    gap="md"
                    className={`py-2 ${idx < sortedItems.length - 1 ? "border-b border-[var(--mantine-color-dark-5)]" : ""}`}
                    wrap="nowrap"
                  >
                    <Text size="sm" fw={500} className="w-20 shrink-0" c="dimmed">
                      {item.startTime}
                      {item.endTime ? `-${item.endTime}` : ""}
                    </Text>
                    <Text size="sm" className="flex-1">
                      {item.title}
                    </Text>
                    {item.isOptional && (
                      <Badge size="xs" variant="outline" color="gray">
                        Optional
                      </Badge>
                    )}
                    {item.linkedHabitId && (
                      <Badge size="xs" variant="light" color="green">
                        Habit
                      </Badge>
                    )}
                    {item.linkedTaskId && (
                      <Badge size="xs" variant="light" color="blue">
                        Task
                      </Badge>
                    )}
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Group>
              <Button
                component={Link}
                href={`/routines/${id}/timeline`}
                leftSection={<IconPlayerPlay size={16} />}
                variant="light"
              >
                View Timeline
              </Button>
              <Button
                component={Link}
                href={`/routines/${id}/analytics`}
                variant="subtle"
              >
                Analytics
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack gap="md">
            <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
            <Text size="sm" fw={500}>Description</Text>
            <Editor
              content={textToEditorContent(description)}
              onChange={(_json, _html, text) => setDescription(text)}
              placeholder="Description"
              minHeight="80px"
              showToolbar={false}
            />
            <SimpleGrid cols={2}>
              <ColorInput label="Color" value={color} onChange={setColor} />
              <Select label="Schedule" data={SCHEDULE_OPTIONS} value={scheduleType} onChange={(v) => v && setScheduleType(v)} />
            </SimpleGrid>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={updateRoutine.isPending}>Save</Button>
            </Group>
          </Stack>
        )}
      </motion.div>
    </div>
  );
}
