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
  NumberInput,
  Card,
  Notification,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconDots, IconTrash, IconCoin, IconBuilding, IconCalendar } from "@tabler/icons-react";

interface SalaryRecord {
  id: string;
  baseSalary: number;
  bonus: number;
  stocks: number;
  incentives: number;
  currency: string;
  effectiveDate: string;
  role: string | null;
  company: string | null;
  notes: string | null;
}

export default function SalaryTab() {
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    baseSalary: 0,
    bonus: 0,
    stocks: 0,
    incentives: 0,
    currency: "USD",
    effectiveDate: "",
    role: "",
    company: "",
    notes: "",
  });

  const loadRecords = () => {
    setLoading(true);
    fetch("/api/career/salary")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        const d = await r.json();
        setRecords(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadRecords, []);

  const handleCreate = async () => {
    if (!form.effectiveDate || form.baseSalary <= 0) return;
    try {
      const res = await fetch("/api/career/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      setForm({ baseSalary: 0, bonus: 0, stocks: 0, incentives: 0, currency: "USD", effectiveDate: "", role: "", company: "", notes: "" });
      close();
      loadRecords();
    } catch {
      setError("Failed to create salary record");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/career/salary/${id}`, { method: "DELETE" });
      loadRecords();
    } catch {
      setError("Failed to delete");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

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
        <Title order={3}>Salary History</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Record
        </Button>
      </Group>

      {error && (
        <Notification color="red" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      {records.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center">
          <Text c="dimmed" size="lg">
            No salary records yet
          </Text>
          <Text c="dimmed" size="sm" mt="xs">
            Track your earnings over time
          </Text>
          <Button leftSection={<IconPlus size={16} />} mt="md" onClick={open}>
            Add Salary Record
          </Button>
        </Paper>
      ) : (
        <Stack gap="sm">
          {records.map((record) => {
            const total = record.baseSalary + record.bonus + record.stocks + record.incentives;
            return (
              <Card key={record.id} withBorder padding="md" radius="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={0}>
                    <Group gap="xs">
                      <IconCoin size={18} />
                      <Text fw={600}>{formatCurrency(total, record.currency)}</Text>
                      <Text size="sm" c="dimmed">/ year</Text>
                    </Group>
                    <Group gap="xs" mt={4}>
                      {record.company && (
                        <Group gap={4}>
                          <IconBuilding size={14} />
                          <Text size="sm" c="dimmed">{record.company}</Text>
                        </Group>
                      )}
                      {record.role && (
                        <Text size="sm" c="dimmed">{record.role}</Text>
                      )}
                    </Group>
                    <Group gap="xs" mt={4}>
                      <Group gap={4}>
                        <IconCalendar size={14} />
                        <Text size="xs" c="dimmed">
                          {new Date(record.effectiveDate).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Base: {formatCurrency(record.baseSalary, record.currency)}
                      </Text>
                      {record.bonus > 0 && (
                        <Text size="xs" c="dimmed">Bonus: {formatCurrency(record.bonus, record.currency)}</Text>
                      )}
                      {record.stocks > 0 && (
                        <Text size="xs" c="dimmed">Stocks: {formatCurrency(record.stocks, record.currency)}</Text>
                      )}
                      {record.incentives > 0 && (
                        <Text size="xs" c="dimmed">Incentives: {formatCurrency(record.incentives, record.currency)}</Text>
                      )}
                    </Group>
                  </Stack>
                  <Menu withinPortal>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => handleDelete(record.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="Add Salary Record" centered size="lg">
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Role"
              placeholder="e.g. Senior Engineer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <TextInput
              label="Company"
              placeholder="e.g. Acme Corp"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Base Salary"
              placeholder="150000"
              min={0}
              value={form.baseSalary}
              onChange={(v) => setForm({ ...form, baseSalary: typeof v === "number" ? v : 0 })}
              required
            />
            <NumberInput
              label="Bonus"
              placeholder="20000"
              min={0}
              value={form.bonus}
              onChange={(v) => setForm({ ...form, bonus: typeof v === "number" ? v : 0 })}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Stocks (annual)"
              placeholder="30000"
              min={0}
              value={form.stocks}
              onChange={(v) => setForm({ ...form, stocks: typeof v === "number" ? v : 0 })}
            />
            <NumberInput
              label="Incentives"
              placeholder="5000"
              min={0}
              value={form.incentives}
              onChange={(v) => setForm({ ...form, incentives: typeof v === "number" ? v : 0 })}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Effective Date"
              type="date"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              required
            />
            <TextInput
              label="Currency"
              placeholder="USD"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value || "USD" })}
            />
          </Group>
          <TextInput
            label="Notes"
            placeholder="Optional notes about this compensation"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
