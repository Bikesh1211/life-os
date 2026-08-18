"use client";

import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Button,
  Modal,
  TextInput,
  Select,
  Progress,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { IconPigMoney, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { BUDGET_PERIODS } from "@/modules/expenses/constants";
import type { BudgetWithSpending, OverviewData } from "@/modules/expenses";
import { apiFetch } from "@/core/api/http";

export default function BudgetsTab() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery<BudgetWithSpending[]>({
    queryKey: ["expenses", "budgets"],
    queryFn: () => apiFetch<BudgetWithSpending[]>("/api/expenses/budgets"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: () => apiFetch<OverviewData>("/api/expenses/overview").then((d) => d.categories),
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      categoryId: "",
      amount: "",
      period: "monthly" as string,
      startDate: dayjs().startOf("month").toISOString(),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    try {
      await apiFetch("/api/expenses/budgets", {
        method: "POST",
        body: JSON.stringify(values),
      });
      notifications.show({ title: "Created", message: "Budget created", color: "green" });
      queryClient.invalidateQueries({ queryKey: ["expenses", "budgets"] });
      form.reset();
      close();
    } catch {
      notifications.show({ title: "Error", message: "Failed to create budget", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  const categoryOptions = (categories ?? []).map((c: { id: string; name: string }) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Budgets</Title>
            <Text c="dimmed" size="sm">
              Track spending against your budgets
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={open} radius="xl">
            Create Budget
          </Button>
        </Group>

        {isLoading ? (
          <Text c="dimmed">Loading budgets...</Text>
        ) : !budgets?.length ? (
          <Card padding="xl" radius="lg" ta="center">
            <ThemeIcon size={60} radius="xl" mx="auto" mb="md" color="yellow">
              <IconPigMoney size={30} />
            </ThemeIcon>
            <Text fw={500}>No budgets yet</Text>
            <Text size="sm" c="dimmed" mb="md">
              Create a budget to start tracking your spending limits.
            </Text>
            <Button onClick={open}>Create Budget</Button>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {budgets.map((budget, index) => {
              const color = budget.categoryColor ?? "blue";
              const remaining = Number(budget.amount) - budget.spent;
              const daysLeft = budget.endDate
                ? dayjs(budget.endDate).diff(dayjs(), "day")
                : dayjs().endOf("month").diff(dayjs(), "day");

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card padding="lg" radius="lg">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={600}>{budget.categoryName ?? "Budget"}</Text>
                        <Text size="sm" c="dimmed" tt="capitalize">
                          {budget.period}
                        </Text>
                      </Group>

                      <Group grow>
                        <div>
                          <Text size="28px" fw={700}>
                            ₹{budget.spent.toLocaleString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            of ₹{Number(budget.amount).toLocaleString()} used
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text size="lg" fw={600} c={remaining < 0 ? "red" : "teal"}>
                            {remaining >= 0 ? "₹" : "-₹"}
                            {Math.abs(remaining).toLocaleString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {remaining >= 0 ? "remaining" : "overspent"}
                          </Text>
                        </div>
                      </Group>

                      <Progress
                        value={budget.percentageUsed}
                        color={budget.percentageUsed > 90 ? "red" : budget.percentageUsed > 70 ? "yellow" : color}
                        size="md"
                        radius="xl"
                      />
                      <Text size="xs" c="dimmed">
                        {daysLeft > 0 ? `${daysLeft} days left` : "Period ending"}
                      </Text>
                    </Stack>
                  </Card>
                </motion.div>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title="Create Budget" radius="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Category"
              placeholder="Select category"
              data={categoryOptions}
              searchable
              required
              key={form.key("categoryId")}
              {...form.getInputProps("categoryId")}
            />
            <TextInput
              label="Budget Amount"
              placeholder="e.g. 400"
              required
              key={form.key("amount")}
              {...form.getInputProps("amount")}
            />
            <Select
              label="Period"
              data={BUDGET_PERIODS.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
              }))}
              key={form.key("period")}
              {...form.getInputProps("period")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
