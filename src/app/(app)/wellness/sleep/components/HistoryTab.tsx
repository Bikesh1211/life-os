"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Stack,
  Group,
  Text,
  Paper,
  Timeline as MantineTimeline,
  ThemeIcon,
  Badge,
  Button,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  SimpleGrid,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBed,
  IconEdit,
  IconTrash,
  IconMoon,
  IconSunrise,
  IconSunset,
  IconStar,
} from "@tabler/icons-react";

type SleepRecord = {
  id: string;
  userId: string;
  bedtime: string;
  wakeTime: string;
  quality: number | null;
  interruptions: number;
  sleepLatencyMinutes: number | null;
  moodAfterWaking: string | null;
  energyLevel: number | null;
  notes: string | null;
  createdAt: string;
};

type DayGroup = {
  date: string;
  totalHours: number;
  avgQuality: number | null;
  records: SleepRecord[];
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

function qualifyStars(quality: number | null) {
  if (!quality) return { stars: "☆☆☆☆☆", color: "gray" };
  if (quality >= 9) return { stars: "⭐⭐⭐⭐⭐", color: "teal" };
  if (quality >= 7) return { stars: "⭐⭐⭐⭐☆", color: "blue" };
  if (quality >= 5) return { stars: "⭐⭐⭐☆☆", color: "yellow" };
  return { stars: "⭐⭐☆☆☆", color: "orange" };
}

function EditSleepModal({
  record,
  opened,
  onClose,
  onSaved,
}: {
  record: SleepRecord | null;
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState<number | "">(7);
  const [interruptions, setInterruptions] = useState<number | "">(0);
  const [sleepLatency, setSleepLatency] = useState<number | "">("");
  const [moodAfterWaking, setMoodAfterWaking] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setBedtime(new Date(record.bedtime).toISOString().slice(0, 16));
      setWakeTime(new Date(record.wakeTime).toISOString().slice(0, 16));
      setQuality(record.quality ?? 7);
      setInterruptions(record.interruptions);
      setSleepLatency(record.sleepLatencyMinutes ?? "");
      setMoodAfterWaking(record.moodAfterWaking ?? null);
      setEnergyLevel(record.energyLevel ?? "");
      setNotes(record.notes ?? "");
    }
  }, [record]);

  const handleSave = useCallback(async () => {
    if (!record || !bedtime || !wakeTime) return;
    setSaving(true);
    try {
      await fetch(`/api/wellness/sleep/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: new Date(bedtime).toISOString(),
          wakeTime: new Date(wakeTime).toISOString(),
          quality: quality || undefined,
          interruptions: interruptions || 0,
          sleepLatencyMinutes: sleepLatency || undefined,
          moodAfterWaking: moodAfterWaking || undefined,
          energyLevel: energyLevel || undefined,
          notes: notes || undefined,
        }),
      });
      onClose();
      onSaved();
    } catch {} finally {
      setSaving(false);
    }
  }, [record, bedtime, wakeTime, quality, interruptions, sleepLatency, moodAfterWaking, energyLevel, notes, onClose, onSaved]);

  const handleDelete = useCallback(async () => {
    if (!record) return;
    if (!confirm("Delete this sleep record?")) return;
    setSaving(true);
    try {
      await fetch(`/api/wellness/sleep/${record.id}`, { method: "DELETE" });
      onClose();
      onSaved();
    } catch {} finally {
      setSaving(false);
    }
  }, [record, onClose, onSaved]);

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Sleep Record" size="md" centered>
      {record && (
        <Stack gap="md">
          <TextInput
            label="Bed Time"
            type="datetime-local"
            value={bedtime}
            onChange={(e) => setBedtime(e.currentTarget.value)}
          />
          <TextInput
            label="Wake Time"
            type="datetime-local"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.currentTarget.value)}
          />
          <SimpleGrid cols={2} spacing="sm">
            <div>
              <Text size="sm" fw={500} mb={4}>Quality (1-10)</Text>
              <NumberInput value={quality} onChange={(v) => setQuality(v as number)} min={1} max={10} />
            </div>
            <div>
              <Text size="sm" fw={500} mb={4}>Interruptions</Text>
              <NumberInput value={interruptions} onChange={(v) => setInterruptions(v as number)} min={0} />
            </div>
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="sm">
            <div>
              <Text size="sm" fw={500} mb={4}>Sleep Latency (min)</Text>
              <NumberInput value={sleepLatency} onChange={(v) => setSleepLatency(v as number)} min={0} max={480} />
            </div>
            <div>
              <Text size="sm" fw={500} mb={4}>Energy (1-5)</Text>
              <NumberInput value={energyLevel} onChange={(v) => setEnergyLevel(v as number)} min={1} max={5} />
            </div>
          </SimpleGrid>
          <Select
            label="Mood After Waking"
            data={[
              { value: "great", label: "😊 Great" },
              { value: "good", label: "🙂 Good" },
              { value: "okay", label: "😐 Okay" },
              { value: "tired", label: "😴 Tired" },
              { value: "exhausted", label: "😫 Exhausted" },
            ]}
            value={moodAfterWaking}
            onChange={setMoodAfterWaking}
            clearable
          />
          <TextInput label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
          <Group justify="space-between">
            <Button color="red" variant="light" onClick={handleDelete} loading={saving}>
              Delete
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

export function HistoryTab() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRecord, setEditRecord] = useState<SleepRecord | null>(null);
  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wellness/sleep?period=month");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const grouped = records.reduce<Map<string, SleepRecord[]>>((acc, r) => {
    const date = new Date(r.bedtime).toISOString().slice(0, 10);
    const existing = acc.get(date) ?? [];
    existing.push(r);
    acc.set(date, existing);
    return acc;
  }, new Map());

  const sortedDays = [...grouped.entries()].sort(([a], [b]) => b.localeCompare(a));

  const handleEdit = (record: SleepRecord) => {
    setEditRecord(record);
    openEdit();
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={300} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>Sleep History</Text>
          <Text size="sm" c="dimmed">Last 30 days</Text>
        </div>
        <Button variant="light" onClick={fetchRecords}>
          Refresh
        </Button>
      </Group>

      {sortedDays.length === 0 ? (
        <Paper withBorder p="xl" className="text-center">
          <Text size="lg" fw={600} mb={4}>No sleep records</Text>
          <Text size="sm" c="dimmed">Log your sleep to see your history here.</Text>
        </Paper>
      ) : (
        <MantineTimeline active={sortedDays.length - 1} bulletSize={32} lineWidth={2}>
          {sortedDays.map(([date, dayRecords]) => {
            const totalMs = dayRecords.reduce((s, r) => s + (new Date(r.wakeTime).getTime() - new Date(r.bedtime).getTime()), 0);
            const totalHours = totalMs / 3600000;
            const qualities = dayRecords.filter((r) => r.quality).map((r) => r.quality as number);
            const avgQuality = qualities.length > 0 ? qualities.reduce((s, q) => s + q, 0) / qualities.length : null;
            const { stars } = qualifyStars(avgQuality);
            const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

            return (
              <MantineTimeline.Item
                key={date}
                bullet={<IconBed size={14} />}
                title={
                  <Group gap={4}>
                    <Text fw={600}>{dateLabel}</Text>
                    <Badge size="sm" variant="light">{formatDuration(totalHours)}</Badge>
                  </Group>
                }
              >
                <Text size="sm" c="dimmed" mb="xs">{stars}</Text>
                {dayRecords.map((r) => (
                  <Paper key={r.id} withBorder p="sm" mb="xs">
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Group gap="xs">
                          <ThemeIcon variant="light" color="indigo" size="sm" radius="xl">
                            <IconSunset size={12} />
                          </ThemeIcon>
                          <Text size="sm">{formatTime(r.bedtime)}</Text>
                          <Text size="sm" c="dimmed">→</Text>
                          <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
                            <IconSunrise size={12} />
                          </ThemeIcon>
                          <Text size="sm">{formatTime(r.wakeTime)}</Text>
                        </Group>
                        <Group gap="xs" mt={2}>
                          {r.quality && <Badge size="sm" variant="dot" color="orange">{r.quality}/10</Badge>}
                          {r.moodAfterWaking && <Badge size="sm" variant="dot" color="grape">{r.moodAfterWaking}</Badge>}
                          {r.energyLevel && <Badge size="sm" variant="dot" color="cyan">Energy: {r.energyLevel}/5</Badge>}
                        </Group>
                        {r.notes && <Text size="xs" c="dimmed" mt={2}>{r.notes}</Text>}
                      </div>
                      <ActionIcon variant="subtle" size="sm" onClick={() => handleEdit(r)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </MantineTimeline.Item>
            );
          })}
        </MantineTimeline>
      )}

      <EditSleepModal
        record={editRecord}
        opened={editOpen}
        onClose={closeEdit}
        onSaved={fetchRecords}
      />
    </Stack>
  );
}
