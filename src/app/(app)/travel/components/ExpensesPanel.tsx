"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconCoin, IconTrash } from "@tabler/icons-react";
import { Card, Text, Group, Badge, Button, Modal, TextInput, Select, Stack, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { apiFetch } from "@/core/api/http";
import dayjs from "dayjs";

type Expense = {
  id: string;
  tripId: string | null;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  date: string;
};

type Trip = {
  id: string;
  title: string;
};

const categoryConfig: Record<string, { color: string; label: string }> = {
  flights: { color: "blue", label: "Flights" },
  hotels: { color: "indigo", label: "Hotels" },
  food: { color: "orange", label: "Food" },
  transportation: { color: "cyan", label: "Transport" },
  shopping: { color: "pink", label: "Shopping" },
  activities: { color: "green", label: "Activities" },
  visa: { color: "violet", label: "Visa" },
  insurance: { color: "grape", label: "Insurance" },
  miscellaneous: { color: "gray", label: "Misc" },
};

export function ExpensesPanel() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    Promise.all([
      apiFetch<Expense[]>("/api/travel/expenses").catch(() => []),
      apiFetch<Trip[]>("/api/travel/trips").catch(() => []),
    ])
      .then(([exp, trps]) => {
        setExpenses(exp);
        setTrips(trps);
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteExpense(id: string) {
    await apiFetch(`/api/travel/expenses/${id}`, { method: "DELETE" });
    notifications.show({ title: "Deleted", message: "Expense deleted", color: "orange" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  if (loading) {
    return (
      <>
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="mb-4 h-24 animate-pulse rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--mantine-color-dark-6,#1a1b1e)]" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <div>
          <h2 className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)]">Expenses</h2>
          <Text size="sm" c="dimmed">${(total / 100).toLocaleString()} total · {expenses.length} entries</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>Add Expense</Button>
      </Group>

      <Modal opened={opened} onClose={close} title="Add Expense" size="md">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          const tripId = data.tripId === "" ? null : data.tripId;
          await apiFetch("/api/travel/expenses", {
            method: "POST",
            body: JSON.stringify({
              category: data.category,
              amount: Math.round(Number(data.amount) * 100),
              description: data.description || undefined,
              date: data.date ? new Date(data.date as string).toISOString() : new Date().toISOString(),
              tripId,
            }),
          });
          notifications.show({ title: "Created", message: "Expense added", color: "green" });
          close();
          window.location.reload();
        }}>
          <Stack gap="sm">
            <Select name="category" label="Category" data={Object.entries(categoryConfig).map(([k, v]) => ({ value: k, label: v.label }))} required />
            <TextInput name="amount" label="Amount" type="number" step="0.01" required />
            <TextInput name="description" label="Description" />
            <Select name="tripId" label="Trip (optional)" data={trips.map((t) => ({ value: t.id, label: t.title }))} clearable />
            <TextInput name="date" label="Date" type="date" />
            <Button type="submit" fullWidth mt="sm">Save</Button>
          </Stack>
        </form>
      </Modal>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)]">
            <IconCoin size={28} className="text-[var(--mantine-color-dimmed,#5c5f66)]" />
          </div>
          <h3 className="text-lg font-semibold">No Expenses Yet</h3>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">Track your travel spending.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(byCategory).map(([cat, amt]) => {
              const config = categoryConfig[cat] ?? { color: "gray", label: cat };
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card shadow="sm" padding="sm" radius="md" withBorder>
                    <Group gap={4} mb={2}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>{config.label}</Text>
                    </Group>
                    <Text size="md" fw={700} style={{ color: `var(--mantine-color-${config.color}-6)` }}>
                      ${(amt / 100).toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed">{Math.round((amt / total) * 100)}%</Text>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Stack gap="sm">
            {expenses.map((expense, i) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card shadow="sm" padding="sm" radius="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Badge color={categoryConfig[expense.category]?.color ?? "gray"} size="sm" variant="light">
                        {categoryConfig[expense.category]?.label ?? expense.category}
                      </Badge>
                      <div>
                        <Text size="sm">{expense.description || "—"}</Text>
                        {expense.date && (
                          <Text size="xs" c="dimmed">{dayjs(expense.date).format("MMM D, YYYY")}</Text>
                        )}
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Text fw={700} size="sm">${(expense.amount / 100).toLocaleString()}</Text>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteExpense(expense.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </Stack>
        </>
      )}
    </>
  );
}
