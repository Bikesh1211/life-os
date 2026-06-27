"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  IconScale,
  IconFlame,
  IconCheck,
  IconX,
  IconClock,
  IconPlus,
  IconList,
  IconTarget,
} from "@tabler/icons-react";
import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Progress,
  RingProgress,
  SimpleGrid,
  Timeline,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";

type Commitment = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  difficulty: string;
  priority: string;
  category: string | null;
  dueDate: string | null;
  createdAt: string;
};

type Dashboard = {
  counts: Record<string, number>;
  total: number;
  active: number;
  completed: number;
  failed: number;
  cancelled: number;
  promiseRatio: number;
  todayCommitments: number;
  upcomingDeadlines: Commitment[];
  integrityScore: number;
  currentStreak: number;
  longestStreak: number;
  recentEvents: Array<{
    id: string;
    commitmentId: string;
    eventType: string;
    metadata: string | null;
    timestamp: string;
    commitment: Commitment | null;
  }>;
};

function CreateCommitmentModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [priority, setPriority] = useState<string>("medium");
  const [category, setCategory] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch("/api/integrity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        difficulty,
        priority,
        category: category || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });
    queryClient.invalidateQueries({ queryKey: ["integrity"] });
    onClose();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="New Commitment" size="md">
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="What do you promise to do?"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="Optional details"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group grow>
          <Select
            label="Difficulty"
            data={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
              { value: "extreme", label: "Extreme" },
            ]}
            value={difficulty}
            onChange={(v) => setDifficulty(v ?? "medium")}
          />
          <Select
            label="Priority"
            data={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            value={priority}
            onChange={(v) => setPriority(v ?? "medium")}
          />
        </Group>
        <Group grow>
          <Select
            label="Category"
            placeholder="Optional"
            data={[
              { value: "personal", label: "Personal" },
              { value: "career", label: "Career" },
              { value: "health", label: "Health" },
              { value: "finance", label: "Finance" },
              { value: "relationships", label: "Relationships" },
              { value: "education", label: "Education" },
              { value: "creative", label: "Creative" },
              { value: "other", label: "Other" },
            ]}
            value={category}
            onChange={setCategory}
            clearable
          />
          <TextInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.currentTarget.value)}
          />
        </Group>
        <Button fullWidth onClick={handleSubmit} mt="sm">
          Make Commitment
        </Button>
      </Stack>
    </Modal>
  );
}

function CommitmentCard({ commitment }: { commitment: Commitment }) {
  const queryClient = useQueryClient();

  const statusColors: Record<string, string> = {
    pending: "yellow",
    in_progress: "blue",
    completed_unverified: "teal",
    completed_verified: "green",
    failed: "red",
    missed: "gray",
    cancelled: "gray",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed_unverified: "Completed",
    completed_verified: "Verified",
    failed: "Failed",
    missed: "Missed",
    cancelled: "Cancelled",
  };

  const difficultyColors: Record<string, string> = {
    easy: "green",
    medium: "yellow",
    hard: "orange",
    extreme: "red",
  };

  async function updateStatus(status: string) {
    await fetch(`/api/integrity/${commitment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: ["integrity"] });
  }

  const isOverdue =
    (commitment.status === "pending" || commitment.status === "in_progress") &&
    commitment.dueDate &&
    new Date(commitment.dueDate) < new Date();

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm" lineClamp={1}>
          {commitment.title}
        </Text>
        <Group gap="xs">
          {isOverdue && (
            <Badge color="red" size="sm" variant="light">Overdue</Badge>
          )}
          <Badge color={difficultyColors[commitment.difficulty] ?? "gray"} size="sm" variant="light">
            {commitment.difficulty}
          </Badge>
          <Badge color={statusColors[commitment.status] ?? "gray"} size="sm" variant="light">
            {statusLabels[commitment.status] ?? commitment.status}
          </Badge>
        </Group>
      </Group>
      {commitment.description && (
        <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
          {commitment.description}
        </Text>
      )}
      {commitment.category && (
        <Badge size="xs" variant="outline" mb="sm">
          {commitment.category}
        </Badge>
      )}
      <Group justify="space-between">
        <Group gap="xs">
          {commitment.status === "pending" && (
            <>
              <Button size="xs" variant="light" color="blue" onClick={() => updateStatus("in_progress")}>
                Start
              </Button>
              <Button size="xs" variant="light" color="green" onClick={() => updateStatus("completed_unverified")}>
                Complete
              </Button>
            </>
          )}
          {commitment.status === "in_progress" && (
            <Button size="xs" variant="light" color="green" onClick={() => updateStatus("completed_unverified")}>
              Complete
            </Button>
          )}
        </Group>
        {commitment.dueDate && (
          <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
            Due: {dayjs(commitment.dueDate).format("MMM D, YYYY")}
          </Text>
        )}
      </Group>
    </Card>
  );
}

export default function DashboardTab() {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: dashboard, isLoading } = useQuery<Dashboard>({
    queryKey: ["integrity", "dashboard"],
    queryFn: () =>
      fetch("/api/integrity?view=dashboard").then((r) => (r.ok ? r.json() : null)),
    staleTime: 30 * 1000,
  });

  if (isLoading) {
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

  const statCards = [
    {
      label: "Integrity Score",
      value: dashboard?.integrityScore ?? 0,
      icon: IconScale,
      color: dashboard && dashboard.integrityScore >= 80 ? "green" : dashboard && dashboard.integrityScore >= 50 ? "yellow" : "red",
    },
    {
      label: "Current Streak",
      value: `${dashboard?.currentStreak ?? 0} days`,
      icon: IconFlame,
      color: dashboard && dashboard.currentStreak >= 7 ? "orange" : "gray",
    },
    {
      label: "Promise Ratio",
      value: `${dashboard?.promiseRatio ?? 0}%`,
      icon: IconCheck,
      color: dashboard && dashboard.promiseRatio >= 80 ? "green" : "yellow",
    },
    {
      label: "Active",
      value: dashboard?.active ?? 0,
      icon: IconTarget,
      color: "blue",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Group justify="space-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              Integrity OS
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              Become a person of your word
            </p>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            New Commitment
          </Button>
        </Group>
      </motion.div>

      <CreateCommitmentModal opened={opened} onClose={close} />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((card) => (
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

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {dashboard && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={600} size="sm" mb="md">
              Score Breakdown
            </Text>
            <div className="flex items-center justify-center">
              <RingProgress
                size={160}
                thickness={16}
                sections={[
                  {
                    value: dashboard.integrityScore,
                    color: dashboard.integrityScore >= 80 ? "green" : dashboard.integrityScore >= 50 ? "yellow" : "red",
                  },
                ]}
                label={
                  <Text ta="center" fw={700} size="xl">
                    {dashboard.integrityScore}
                  </Text>
                }
              />
            </div>
            <Stack gap="xs" mt="md">
              <Group justify="space-between">
                <Text size="sm">Completed</Text>
                <Text size="sm" fw={600}>{dashboard.completed}</Text>
              </Group>
              <Progress value={dashboard.total > 0 ? (dashboard.completed / dashboard.total) * 100 : 0} size="sm" color="green" />
              <Group justify="space-between">
                <Text size="sm">Failed</Text>
                <Text size="sm" fw={600}>{dashboard.failed}</Text>
              </Group>
              <Progress value={dashboard.total > 0 ? (dashboard.failed / dashboard.total) * 100 : 0} size="sm" color="red" />
              <Group justify="space-between">
                <Text size="sm">Cancelled</Text>
                <Text size="sm" fw={600}>{dashboard.cancelled}</Text>
              </Group>
              <Progress value={dashboard.total > 0 ? (dashboard.cancelled / dashboard.total) * 100 : 0} size="sm" color="gray" />
            </Stack>
          </Card>
        )}

        {dashboard?.recentEvents && dashboard.recentEvents.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={600} size="sm" mb="md">
              Recent Activity
            </Text>
            <Timeline active={dashboard.recentEvents.length - 1} bulletSize={24} lineWidth={2}>
              {dashboard.recentEvents.slice(0, 8).map((event) => (
                <Timeline.Item
                  key={event.id}
                  title={event.eventType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  bullet={
                    event.eventType === "completed" || event.eventType === "evidence_uploaded"
                      ? <IconCheck size={12} />
                      : event.eventType === "failed" || event.eventType === "missed"
                        ? <IconX size={12} />
                        : <IconClock size={12} />
                  }
                >
                  <Text size="xs" c="dimmed">
                    {event.commitment?.title ?? "Unknown commitment"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {dayjs(event.timestamp).format("MMM D, h:mm A")}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>

      {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 && (
        <div className="mb-8">
          <Text fw={600} size="sm" mb="sm">
            Upcoming Deadlines
          </Text>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.upcomingDeadlines.slice(0, 6).map((commitment) => (
              <CommitmentCard key={commitment.id} commitment={commitment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
