"use client";

import {
  Container,
  Stack,
  Title,
  Text,
  Card,
  Group,
  TextInput,
  Select,
  ActionIcon,
  Badge,
  Table,
  Button,
  Menu,
  Pagination,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import dayjs from "dayjs";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconTrash,
  IconDotsVertical,
  IconEdit,
} from "@tabler/icons-react";
import { EditTransactionModal } from "./EditTransactionModal";
import type { Transaction, Account, OverviewData } from "@/modules/expenses";
import { apiFetch, toSearchParams } from "@/core/api/http";

export default function TransactionsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();
  const limit = 50;

  async function handleDelete(tx: Transaction) {
    if (!window.confirm(`Delete transaction with ${tx.merchant ?? "—"}?`)) return;
    try {
      await apiFetch(`/api/expenses/transactions/${tx.id}`, { method: "DELETE" });
      notifications.show({ title: "Deleted", message: "Transaction deleted", color: "orange" });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    } catch {
      notifications.show({ title: "Error", message: "Failed to delete transaction", color: "red" });
    }
  }

  const { data, isLoading } = useQuery<Transaction[]>({
    queryKey: ["expenses", "transactions", search, page],
    queryFn: () =>
      apiFetch<Transaction[]>(
        `/api/expenses/transactions${toSearchParams({
          search,
          limit,
          offset: (page - 1) * limit,
        })}`,
      ),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: () => apiFetch<OverviewData>("/api/expenses/overview").then((d) => d.categories ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: accounts } = useQuery({
    queryKey: ["expenses", "accounts"],
    queryFn: () => apiFetch<Account[]>("/api/expenses/accounts"),
    staleTime: 5 * 60 * 1000,
  });

  const categoryOptions = (categories ?? []).map((c: { id: string; name: string }) => ({
    value: c.id,
    label: c.name,
  }));

  const accountOptions = (accounts ?? []).map((a: { id: string; name: string }) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <Container size="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Transactions</Title>
            <Text c="dimmed" size="sm">
              All your expenses and income
            </Text>
          </div>
          <Group>
            <Button variant="default" leftSection={<IconDownload size={16} />} size="sm">
              Export
            </Button>
          </Group>
        </Group>

        <Card padding="md" radius="lg">
          <Group mb="md">
            <TextInput
              placeholder="Search merchants, notes..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Category"
              data={[]}
              leftSection={<IconFilter size={16} />}
              clearable
              size="sm"
              className="hidden sm:block"
            />
            <Select
              placeholder="Type"
              data={[
                { value: "expense", label: "Expenses" },
                { value: "income", label: "Income" },
              ]}
              clearable
              size="sm"
              className="hidden sm:block"
            />
          </Group>

          <Box visibleFrom="sm" hidden />
          <Box hiddenFrom="sm">
            {isLoading ? (
              <Text c="dimmed" ta="center" py="xl">
                Loading...
              </Text>
            ) : !data?.length ? (
              <Text c="dimmed" ta="center" py="xl">
                No transactions yet. Add your first expense!
              </Text>
            ) : (
              <Stack gap="sm">
                {data.map((tx) => (
                  <Card key={tx.id} padding="sm" radius="md" withBorder>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={600}>
                        {tx.merchant ?? "—"}
                      </Text>
                      <Text size="sm" fw={700} c={tx.type === "income" ? "teal" : undefined}>
                        {tx.type === "income" ? "+" : "-"}₹
                        {Number(tx.amount).toLocaleString()}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1} mb={4}>
                      {tx.description ?? "—"}
                    </Text>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {dayjs(tx.transactionDate).format("MMM D, YYYY")}
                      </Text>
                      {tx.paymentMethod && (
                        <>
                          <Text size="xs" c="dimmed">·</Text>
                          <Text size="xs" c="dimmed" tt="capitalize">
                            {tx.paymentMethod.replace(/_/g, " ")}
                          </Text>
                        </>
                      )}
                      {tx.isRecurring && (
                        <Badge size="xs" variant="light" color="blue">
                          Recurring
                        </Badge>
                      )}
                    </Group>
                    <Group gap="xs" mt={6}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        onClick={() => setEditTransaction(tx)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="red"
                        onClick={() => handleDelete(tx)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          <Box visibleFrom="sm">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Merchant</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Payment Method</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text c="dimmed" ta="center" py="xl">
                        Loading...
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : !data?.length ? (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text c="dimmed" ta="center" py="xl">
                        No transactions yet. Add your first expense!
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  data.map((tx) => (
                    <Table.Tr key={tx.id}>
                      <Table.Td>
                        <Text size="sm">
                          {dayjs(tx.transactionDate).format("MMM D, YYYY")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text size="sm" fw={500}>
                            {tx.merchant ?? "—"}
                          </Text>
                          {tx.isRecurring && (
                            <Badge size="xs" variant="light" color="blue">
                              Recurring
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed" lineClamp={1} maw={200}>
                          {tx.description ?? "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {tx.categoryId ? "—" : "Uncategorized"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600} c={tx.type === "income" ? "teal" : undefined}>
                          {tx.type === "income" ? "+" : "-"}₹
                          {Number(tx.amount).toLocaleString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed" tt="capitalize">
                          {tx.paymentMethod?.replace(/_/g, " ") ?? "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Menu shadow="md" width={150}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" size="sm">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => setEditTransaction(tx)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(tx)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Box>

          <Group justify="center" mt="md">
            <Pagination total={10} value={page} onChange={setPage} size="sm" />
          </Group>
        </Card>
      </Stack>

      <EditTransactionModal
        transaction={editTransaction}
        opened={!!editTransaction}
        onClose={() => setEditTransaction(null)}
        categories={categoryOptions}
        accounts={accountOptions}
      />
    </Container>
  );
}
