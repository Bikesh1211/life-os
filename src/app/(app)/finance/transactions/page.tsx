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
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconTrash,
  IconDotsVertical,
  IconEye,
} from "@tabler/icons-react";

type Transaction = {
  id: string;
  amount: string;
  merchant: string | null;
  description: string | null;
  categoryId: string | null;
  paymentMethod: string | null;
  transactionDate: string;
  type: string;
  isRecurring: boolean;
  accountId: string | null;
};

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading } = useQuery<Transaction[]>({
    queryKey: ["expenses", "transactions", search, page],
    queryFn: () =>
      fetch(
        `/api/expenses/transactions?search=${search}&limit=${limit}&offset=${(page - 1) * limit}`,
      ).then((r) => r.json()),
  });

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
            />
            <Select
              placeholder="Type"
              data={[
                { value: "expense", label: "Expenses" },
                { value: "income", label: "Income" },
              ]}
              clearable
              size="sm"
            />
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Merchant</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Payment Method</Table.Th>
                <Table.Th>Account</Table.Th>
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
                      <Text size="sm" c="dimmed">
                        {tx.categoryId ? "—" : "Uncategorized"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="sm"
                        fw={600}
                        c={tx.type === "income" ? "teal" : undefined}
                      >
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
                      <Text size="sm" c="dimmed">
                        {tx.accountId ? "—" : "—"}
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
                          <Menu.Item leftSection={<IconEye size={14} />}>
                            View
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
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

          <Group justify="center" mt="md">
            <Pagination total={10} value={page} onChange={setPage} size="sm" />
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
