"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconTarget, IconActivity, IconCheck, IconClock, IconPlus } from "@tabler/icons-react";
import { Card, Text, Progress, Group, Badge, Button, Modal, TextInput, Textarea, Select, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: "long-term" | "short-term";
  status: "draft" | "active" | "completed" | "cancelled";
  progress: number;
  deadline: string | null;
  category: string | null;
  reward: string | null;
  createdAt: string;
};

type Overview = {
  total: number;
  active: number;
  completed: number;
  draft: number;
  recentGoals: Goal[];
  overdueGoals: Goal[];
};

function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const isOverdue =
    goal.status === "active" && goal.deadline && new Date(goal.deadline) < new Date();

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      onClick={() => router.push(`/goals/${goal.id}`)}
      style={{ cursor: "pointer" }}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm" lineClamp={1}>
          {goal.title}
        </Text>
        <Group gap="xs">
          {isOverdue && (
            <Badge color="red" size="sm" variant="light">
              Overdue
            </Badge>
          )}
          <Badge
            color={goal.type === "long-term" ? "violet" : "blue"}
            size="sm"
            variant="light"
          >
            {goal.type === "long-term" ? "Long-term" : "Short-term"}
          </Badge>
        </Group>
      </Group>
      {goal.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
          {goal.description}
        </Text>
      )}
      <Progress value={goal.progress} size="sm" mb="xs" />
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {goal.progress}% complete
        </Text>
        {goal.deadline && (
          <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
            {dayjs(goal.deadline).format("MMM D, YYYY")}
          </Text>
        )}
      </Group>
    </Card>
  );
}

function CreateGoalModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"long-term" | "short-term">("short-term");
  const [category, setCategory] = useState<string | null>(null);
  const [deadline, setDeadline] = useState("");
  const [reward, setReward] = useState("");

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        type,
        category: category || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        reward: reward || undefined,
      }),
    });
    onClose();
    window.location.reload();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create Goal" size="md">
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="What do you want to achieve?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="Why is this goal important?"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group grow>
          <Select
            label="Type"
            data={[
              { value: "short-term", label: "Short-term" },
              { value: "long-term", label: "Long-term" },
            ]}
            value={type}
            onChange={(v) => setType(v as "long-term" | "short-term")}
          />
          <Select
            label="Category"
            placeholder="Optional"
            data={[
              { value: "career", label: "Career" },
              { value: "education", label: "Education" },
              { value: "health", label: "Health" },
              { value: "finance", label: "Finance" },
              { value: "personal", label: "Personal" },
              { value: "relationships", label: "Relationships" },
              { value: "business", label: "Business" },
              { value: "creative", label: "Creative" },
            ]}
            value={category}
            onChange={setCategory}
            clearable
          />
        </Group>
        <TextInput
          label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.currentTarget.value)}
        />
        <TextInput
          label="Reward"
          placeholder="What do you get when you complete this?"
          value={reward}
          onChange={(e) => setReward(e.currentTarget.value)}
        />
        <Button fullWidth onClick={handleSubmit} mt="sm">
          Create Goal
        </Button>
      </Stack>
    </Modal>
  );
}

export default function GoalsOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    fetch("/api/goals/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOverview(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Goals", value: overview?.total ?? 0, icon: IconTarget, color: "blue" },
    { label: "Active", value: overview?.active ?? 0, icon: IconActivity, color: "green" },
    { label: "Completed", value: overview?.completed ?? 0, icon: IconCheck, color: "teal" },
    { label: "Overdue", value: overview?.overdueGoals?.length ?? 0, icon: IconClock, color: "red" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Group justify="space-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              Goals
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              Track your life goals and progress
            </p>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            New Goal
          </Button>
        </Group>
      </motion.div>

      <CreateGoalModal opened={opened} onClose={close} />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} shadow="sm" padding="md" radius="md" withBorder>
            <Group gap="xs" mb={4}>
              <card.icon size={20} style={{ color: `var(--mantine-color-${card.color}-6)` }} />
              <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                {card.label}
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {card.value}
            </Text>
          </Card>
        ))}
      </div>

      {overview?.overdueGoals && overview.overdueGoals.length > 0 && (
        <div className="mb-8">
          <Text fw={600} size="sm" mb="sm" c="red">
            Overdue Goals
          </Text>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.overdueGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {overview?.recentGoals && overview.recentGoals.length > 0 && (
        <div>
          <Text fw={600} size="sm" mb="sm">
            Recent Goals
          </Text>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.recentGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {(!overview?.recentGoals || overview.recentGoals.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconTarget size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Goals Yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            Create your first goal to start tracking your life ambitions.
          </p>
          <Button leftSection={<IconPlus size={18} />} onClick={open} mt="md">
            Create Your First Goal
          </Button>
        </div>
      )}
    </div>
  );
}
