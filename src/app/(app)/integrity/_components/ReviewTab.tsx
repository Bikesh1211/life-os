"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Select,
  Stack,
  Modal,
  Textarea,
  Progress,
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

export default function ReviewTab() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [priority, setPriority] = useState<string>("medium");
  const [category, setCategory] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  const statusParams = new URLSearchParams();
  if (statusFilter) statusParams.set("status", statusFilter);
  if (categoryFilter) statusParams.set("category", categoryFilter);
  const queryString = statusParams.toString();

  const { data: commitments, isLoading } = useQuery<Commitment[]>({
    queryKey: ["integrity", "commitments", statusFilter, categoryFilter],
    queryFn: () =>
      fetch(`/api/integrity${queryString ? `?${queryString}` : ""}`).then((r) =>
        r.ok ? r.json() : [],
      ),
    staleTime: 30 * 1000,
  });

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

  async function handleCreate() {
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
    close();
  }

  async function updateStatus(commitmentId: string, status: string) {
    await fetch(`/api/integrity/${commitmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: ["integrity"] });
  }

  const filtered = (commitments ?? []).filter((c) => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Group justify="space-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-4xl">
              Review
            </h1>
            <p className="mt-1 text-[var(--mantine-color-dimmed,#5c5f66)]">
              Manage your commitments
            </p>
          </div>
          <Button onClick={open}>New Commitment</Button>
        </Group>
      </motion.div>

      <Modal opened={opened} onClose={close} title="New Commitment" size="md">
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
          <Button fullWidth onClick={handleCreate} mt="sm">
            Make Commitment
          </Button>
        </Stack>
      </Modal>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <TextInput
          placeholder="Search commitments..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          className="sm:w-64"
        />
        <Select
          placeholder="All statuses"
          data={[
            { value: "", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed_unverified", label: "Completed" },
            { value: "completed_verified", label: "Verified" },
            { value: "failed", label: "Failed" },
            { value: "missed", label: "Missed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          value={statusFilter ?? ""}
          onChange={(v) => setStatusFilter(v || null)}
          clearable
          className="sm:w-48"
        />
        <Select
          placeholder="All categories"
          data={[
            { value: "", label: "All categories" },
            { value: "personal", label: "Personal" },
            { value: "career", label: "Career" },
            { value: "health", label: "Health" },
            { value: "finance", label: "Finance" },
            { value: "relationships", label: "Relationships" },
            { value: "education", label: "Education" },
            { value: "creative", label: "Creative" },
          ]}
          value={categoryFilter ?? ""}
          onChange={(v) => setCategoryFilter(v || null)}
          clearable
          className="sm:w-48"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconFilter size={32} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
            No Commitments Found
          </h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            {searchQuery || statusFilter || categoryFilter
              ? "Try adjusting your filters."
              : "Make your first commitment to start tracking your integrity."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((commitment) => (
            <Card key={commitment.id} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm" lineClamp={1}>
                  {commitment.title}
                </Text>
                <Badge color={statusColors[commitment.status] ?? "gray"} size="sm" variant="light">
                  {statusLabels[commitment.status] ?? commitment.status}
                </Badge>
              </Group>
              {commitment.description && (
                <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
                  {commitment.description}
                </Text>
              )}
              <Group gap="xs" mb="sm">
                <Badge size="xs" color={commitment.difficulty === "easy" ? "green" : commitment.difficulty === "hard" ? "orange" : commitment.difficulty === "extreme" ? "red" : "yellow"} variant="light">
                  {commitment.difficulty}
                </Badge>
                {commitment.category && (
                  <Badge size="xs" variant="outline">
                    {commitment.category}
                  </Badge>
                )}
              </Group>
              <Group gap="xs">
                {commitment.status === "pending" && (
                  <>
                    <Button size="xs" variant="light" color="blue" onClick={() => updateStatus(commitment.id, "in_progress")}>
                      Start
                    </Button>
                    <Button size="xs" variant="light" color="green" onClick={() => updateStatus(commitment.id, "completed_unverified")}>
                      Complete
                    </Button>
                  </>
                )}
                {commitment.status === "in_progress" && (
                  <>
                    <Button size="xs" variant="light" color="green" onClick={() => updateStatus(commitment.id, "completed_unverified")}>
                      Complete
                    </Button>
                    <Button size="xs" variant="light" color="red" onClick={() => updateStatus(commitment.id, "failed")}>
                      Fail
                    </Button>
                  </>
                )}
                {(commitment.status === "pending" || commitment.status === "in_progress") && (
                  <Button size="xs" variant="light" color="gray" onClick={() => updateStatus(commitment.id, "cancelled")}>
                    Cancel
                  </Button>
                )}
              </Group>
              {commitment.dueDate && (
                <Text size="xs" c="dimmed" mt="sm">
                  Due: {dayjs(commitment.dueDate).format("MMM D, YYYY")}
                </Text>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
