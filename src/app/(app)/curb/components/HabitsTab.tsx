"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Paper, Text, Group, Stack, SimpleGrid, Badge, Button, ActionIcon,
  Progress, Tooltip, Modal, TextInput, Select, NumberInput, Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconMinus, IconStar, IconArchive, IconSettings } from "@tabler/icons-react";

type Habit = {
  id: string;
  name: string;
  icon: string | null;
  categoryId: string;
  limitType: string;
  limitValue: number;
  color: string | null;
  isArchived: boolean;
  sortOrder: number;
};

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type TodayCount = Record<string, number>;

function HabitCard({
  habit,
  todayCount,
  onIncrement,
  onDecrement,
}: {
  habit: Habit;
  todayCount: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}) {
  const limit = habit.limitValue;
  const isZero = habit.limitType === "zero";
  const exceeded = isZero ? todayCount > 0 : (limit > 0 && todayCount > limit);
  const nearLimit = !isZero && limit > 0 && todayCount >= limit * 0.8;
  const color = habit.color ?? "#3b82f6";

  return (
    <Paper withBorder p="md" radius="lg">
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <div className="rounded-lg p-2" style={{ background: `${color}15` }}>
            <Text size="lg">{habit.icon ?? "📌"}</Text>
          </div>
          <div>
            <Text fw={600} size="sm">{habit.name}</Text>
            {!isZero && (
              <Text size="xs" c="dimmed">Target: {habit.limitType === "daily" ? "≤" : habit.limitType === "weekly" ? "≤/wk" : "≤/mo"} {limit > 0 ? limit : "—"}</Text>
            )}
            {isZero && <Text size="xs" c="dimmed">Zero target</Text>}
          </div>
        </Group>
        <Badge
          size="xl"
          variant={exceeded ? "filled" : "light"}
          color={exceeded ? "red" : nearLimit ? "yellow" : "teal"}
          styles={{ label: { fontSize: "18px", fontWeight: 700 } }}
        >
          {todayCount}
        </Badge>
      </Group>

      <Group gap="xs">
        <Tooltip label="Increment">
          <ActionIcon
            size="lg"
            variant="filled"
            color={color}
            radius="md"
            onClick={() => onIncrement(habit.id)}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Tooltip>
        {todayCount > 0 && (
          <Tooltip label="Undo last">
            <ActionIcon
              size="lg"
              variant="light"
              color="gray"
              radius="md"
              onClick={() => onDecrement(habit.id)}
            >
              <IconMinus size={16} />
            </ActionIcon>
          </Tooltip>
        )}
        <div className="flex-1" />
        {!isZero && limit > 0 && (
          <div className="w-24">
            <Progress
              value={Math.min(100, (todayCount / limit) * 100)}
              color={exceeded ? "red" : nearLimit ? "yellow" : "teal"}
              size="sm"
              radius="xl"
            />
          </div>
        )}
      </Group>
    </Paper>
  );
}

export function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [todayCounts, setTodayCounts] = useState<TodayCount>({});
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const loadData = useCallback(async () => {
    const [habitsRes, catsRes, logsRes] = await Promise.all([
      fetch("/api/curb/habits?includeArchived=false"),
      fetch("/api/curb/categories"),
      fetch("/api/curb/timeline?date=" + new Date().toISOString().slice(0, 10)),
    ]);
    const [habitsData, catsData, logsData] = await Promise.all([
      habitsRes.json(), catsRes.json(), logsRes.json(),
    ]);
    setHabits(habitsData);
    setCategories(catsData);

    const counts: TodayCount = {};
    for (const log of logsData) {
      counts[log.habitId] = (counts[log.habitId] ?? 0) + 1;
    }
    setTodayCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleIncrement = async (habitId: string) => {
    setTodayCounts((prev) => ({ ...prev, [habitId]: (prev[habitId] ?? 0) + 1 }));
    setHabits((prev) => prev);
    await fetch("/api/curb/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId }),
    }).catch(() => loadData());
  };

  const handleDecrement = async (habitId: string) => {
    const prev = todayCounts[habitId] ?? 0;
    if (prev <= 0) return;
    setTodayCounts((prev) => ({ ...prev, [habitId]: Math.max(0, (prev[habitId] ?? 0) - 1) }));
    await fetch(`/api/curb/logs?mode=decrement&habitId=${habitId}`, { method: "DELETE" })
      .catch(() => loadData());
  };

  const grouped = categories
    .map((cat) => ({
      ...cat,
      habits: habits.filter((h) => h.categoryId === cat.id),
    }))
    .filter((g) => g.habits.length > 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={140} radius="lg" />
        ))}
      </div>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="lg" fw={700}>Your Habits</Text>
        <Button leftSection={<IconPlus size={16} />} variant="light" onClick={open}>
          Add Habit
        </Button>
      </Group>

      {grouped.map((group) => (
        <div key={group.id}>
          <Group gap="xs" mb="sm">
            <Text size="sm" tt="uppercase" fw={700} c="dimmed">{group.name}</Text>
            <Badge size="sm" variant="light">{group.habits.length}</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="sm">
            {group.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayCount={todayCounts[habit.id] ?? 0}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            ))}
          </SimpleGrid>
        </div>
      ))}

      {/* Add habit modal */}
      <Modal opened={opened} onClose={close} title="Add Custom Habit" centered>
        <AddHabitForm
          categories={categories}
          onSuccess={() => { close(); loadData(); }}
        />
      </Modal>
    </Stack>
  );
}

function AddHabitForm({ categories, onSuccess }: { categories: Category[]; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [limitType, setLimitType] = useState<string>("daily");
  const [limitValue, setLimitValue] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !categoryId) return;
    setSubmitting(true);
    try {
      await fetch("/api/curb/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categoryId, limitType, limitValue }),
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="sm">
      <TextInput label="Habit Name" value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="e.g. Biting Nails" required />
      <Select label="Category" data={categories.map((c) => ({ value: c.id, label: c.name }))} value={categoryId} onChange={(v) => setCategoryId(v ?? "")} required />
      <Select label="Limit Type" data={["daily", "weekly", "monthly", "zero"]} value={limitType} onChange={(v) => setLimitType(v ?? "daily")} />
      {limitType !== "zero" && (
        <NumberInput label="Max Allowed" value={limitValue} onChange={(v) => setLimitValue(Number(v) || 0)} min={1} />
      )}
      <Button fullWidth onClick={handleSubmit} loading={submitting} mt="sm">Add Habit</Button>
    </Stack>
  );
}
