"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Skeleton,
  Modal,
  TextInput,
  Select,
  Textarea,
  Card,
  Badge,
  Notification,
  SimpleGrid,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconTrash, IconCalendar, IconBuilding, IconMapPin } from "@tabler/icons-react";
import { apiFetch, toSearchParams } from "@/core/api/http";

interface Application {
  id: string;
  company: string;
  position: string;
  location: string | null;
  salaryRange: string | null;
  status: string;
  isRemote: boolean | null;
  applicationDate: string | null;
  notes: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  wishlist: "gray",
  saved: "blue",
  applied: "cyan",
  assessment: "teal",
  interview: "violet",
  technical_interview: "purple",
  final_interview: "pink",
  offer: "green",
  negotiation: "yellow",
  accepted: "lime",
  rejected: "red",
};

const statusLabels: Record<string, string> = {
  wishlist: "Wishlist",
  saved: "Saved",
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  technical_interview: "Technical",
  final_interview: "Final",
  offer: "Offer",
  negotiation: "Negotiation",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "",
    position: "",
    location: "",
    salaryRange: "",
    status: "wishlist" as string,
    isRemote: null as boolean | null,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loadApps = () => {
    setLoading(true);
    const url = `/api/career/applications${toSearchParams({ status: filter })}`;
    apiFetch<Application[]>(url)
      .then((d) => {
        setApps(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadApps, [filter]);

  const handleCreate = async () => {
    if (!form.company.trim() || !form.position.trim()) return;
    try {
      await apiFetch("/api/career/applications", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ company: "", position: "", location: "", salaryRange: "", status: "wishlist", isRemote: null, notes: "" });
      close();
      loadApps();
    } catch {
      setError("Failed to create application");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/api/career/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/career/applications/${id}`, { method: "DELETE" });
      loadApps();
    } catch {
      setError("Failed to delete");
    }
  };

  const statuses = ["wishlist", "saved", "applied", "assessment", "interview", "technical_interview", "final_interview", "offer", "negotiation", "accepted", "rejected"];

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Job Applications</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          New Application
        </Button>
      </Group>

      {error && (
        <Notification color="red" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <Group gap="xs">
        <Button
          size="xs"
          variant={filter === null ? "filled" : "outline"}
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        {statuses.map((s) => (
          <Button
            key={s}
            size="xs"
            variant={filter === s ? "filled" : "outline"}
            color={statusColors[s]}
            onClick={() => setFilter(s)}
          >
            {statusLabels[s]}
          </Button>
        ))}
      </Group>

      {apps.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="lg">
            No applications yet
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Start tracking your job applications
          </Text>
          <Button leftSection={<IconPlus size={16} />} mt="md" onClick={open}>
            Add Application
          </Button>
        </Paper>
      ) : (
        <Stack gap="sm">
          {apps.map((app) => (
            <Card key={app.id} withBorder padding="md" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={0}>
                  <Group gap="xs">
                    <Text fw={600}>{app.position}</Text>
                    <Badge color={statusColors[app.status] ?? "gray"} size="sm">
                      {statusLabels[app.status] ?? app.status}
                    </Badge>
                  </Group>
                  <Group gap="xs" mt={4}>
                    <Group gap={4}>
                      <IconBuilding size={14} />
                      <Text size="sm" c="dimmed">
                        {app.company}
                      </Text>
                    </Group>
                    {app.location && (
                      <Group gap={4}>
                        <IconMapPin size={14} />
                        <Text size="sm" c="dimmed">
                          {app.location}
                        </Text>
                      </Group>
                    )}
                    {app.salaryRange && (
                      <Text size="sm" c="dimmed">
                        {app.salaryRange}
                      </Text>
                    )}
                  </Group>
                  {app.applicationDate && (
                    <Group gap={4} mt={4}>
                      <IconCalendar size={14} />
                      <Text size="xs" c="dimmed">
                        Applied {new Date(app.applicationDate).toLocaleDateString()}
                      </Text>
                    </Group>
                  )}
                </Stack>
                <Menu withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Move to</Menu.Label>
                    {statuses.map((s) => (
                      <Menu.Item
                        key={s}
                        onClick={() => handleStatusChange(app.id, s)}
                        disabled={s === app.status}
                      >
                        {statusLabels[s]}
                      </Menu.Item>
                    ))}
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="New Application" centered size="lg">
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Company"
              placeholder="e.g. Google"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              data-autofocus
              required
            />
            <TextInput
              label="Position"
              placeholder="e.g. Software Engineer"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              required
            />
          </Group>
          <Group grow>
            <TextInput
              label="Location"
              placeholder="e.g. San Francisco, CA"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <TextInput
              label="Salary Range"
              placeholder="e.g. $150k-$200k"
              value={form.salaryRange}
              onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            />
          </Group>
          <Select
            label="Status"
            data={statuses.map((s) => ({ value: s, label: statusLabels[s] }))}
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v ?? "wishlist" })}
          />
          <Textarea
            label="Notes"
            placeholder="Any notes about this application..."
            minRows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
