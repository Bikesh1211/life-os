"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput, Group, Select, Stack, Card, Text, Badge, ActionIcon,
  Grid, Skeleton, Tooltip, Menu, Button, SimpleGrid, ThemeIcon,
  SegmentedControl, Pagination,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch, IconEye, IconPin, IconArchive, IconTrash,
  IconArrowUpRight, IconArrowDownRight, IconDots,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { apiFetch, toSearchParams } from "@/core/api/http";

interface LoanRow {
  id: string;
  direction: "lent" | "borrowed";
  principalAmount: string;
  currency: string;
  totalPayable: string | null;
  loanDate: string;
  dueDate: string | null;
  purpose: string | null;
  status: string;
  isPinned: boolean;
  connectionId: string | null;
  paidAmount: string;
  remainingAmount: string;
  completionPercentage: number;
  isOverdue: boolean;
}

export default function LoansList() {
  const router = useRouter();
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [direction, setDirection] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ loans: LoanRow[]; total: number }>(
        `/api/loans${toSearchParams({
          search: debouncedSearch || undefined,
          direction: direction || undefined,
          status: status || undefined,
          sortBy,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        })}`,
      );
      setLoans(data.loans ?? []);
      setTotal(data.total ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [debouncedSearch, direction, status, sortBy, page]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const totalPages = Math.ceil(total / pageSize);

  const statusColor: Record<string, string> = {
    active: "blue",
    partially_paid: "yellow",
    fully_paid: "green",
    cancelled: "gray",
    disputed: "red",
  };

  return (
    <Stack gap="md">
      <Group gap="sm">
        <TextInput
          placeholder="Search loans..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          style={{ flex: 1 }}
          radius="lg"
        />
        <Select
          placeholder="Direction"
          data={[
            { value: "lent", label: "Lent" },
            { value: "borrowed", label: "Borrowed" },
          ]}
          value={direction}
          onChange={setDirection}
          clearable
          radius="lg"
          w={140}
        />
        <Select
          placeholder="Status"
          data={[
            { value: "active", label: "Active" },
            { value: "partially_paid", label: "Partially Paid" },
            { value: "fully_paid", label: "Fully Paid" },
            { value: "overdue", label: "Overdue" },
          ]}
          value={status}
          onChange={setStatus}
          clearable
          radius="lg"
          w={160}
        />
        <Select
          placeholder="Sort"
          data={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "amount_high", label: "Highest Amount" },
            { value: "amount_low", label: "Lowest Amount" },
            { value: "due_soon", label: "Due Soon" },
          ]}
          value={sortBy}
          onChange={(v) => setSortBy(v ?? "newest")}
          radius="lg"
          w={150}
        />
      </Group>

      {loading ? (
        <SimpleGrid cols={1} spacing="sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={80} radius="lg" />
          ))}
        </SimpleGrid>
      ) : loans.length === 0 ? (
        <Card withBorder radius="lg" p="xl" ta="center">
          <ThemeIcon size={48} radius="xl" mx="auto" mb="sm" color="gray" variant="light">
            <IconSearch size={24} />
          </ThemeIcon>
          <Text fw={500} mb={4}>No loans found</Text>
          <Text size="sm" c="dimmed">
            {debouncedSearch ? "Try a different search term" : "Create your first loan to get started"}
          </Text>
        </Card>
      ) : (
        <>
          <Stack gap="sm">
            {loans.map((loan) => (
              <Card
                key={loan.id}
                withBorder
                radius="lg"
                padding="md"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/finance/loans/${loan.id}`)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      size={40}
                      radius="xl"
                      color={loan.direction === "lent" ? "red" : "blue"}
                      variant="light"
                    >
                      {loan.direction === "lent" ? <IconArrowUpRight size={20} /> : <IconArrowDownRight size={20} />}
                    </ThemeIcon>
                    <div>
                      <Group gap="xs" mb={2}>
                        <Text fw={600} size="sm">{loan.purpose || "Loan"}</Text>
                        {loan.isPinned && <IconPin size={14} />}
                        {loan.isOverdue && <Badge size="sm" color="red" variant="light">Overdue</Badge>}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {dayjs(loan.loanDate).format("MMM D, YYYY")}
                        {loan.dueDate && ` · Due ${dayjs(loan.dueDate).format("MMM D, YYYY")}`}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <div style={{ textAlign: "right" }}>
                      <Text fw={700}>
                        {loan.currency} {Number(loan.totalPayable || loan.principalAmount).toLocaleString()}
                      </Text>
                      {loan.status === "partially_paid" && (
                        <Text size="xs" c="dimmed">
                          {loan.completionPercentage}% paid
                        </Text>
                      )}
                    </div>
                    <Badge color={statusColor[loan.status] || "gray"} variant="light" size="sm">
                      {loan.status.replace("_", " ")}
                    </Badge>
                    <Menu withinPortal position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={(e) => { e.stopPropagation(); router.push(`/finance/loans/${loan.id}`); }}>
                          View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconPin size={14} />}>
                          {loan.isPinned ? "Unpin" : "Pin"}
                        </Menu.Item>
                        <Menu.Item leftSection={<IconArchive size={14} />}>
                          Archive
                        </Menu.Item>
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={setPage} radius="xl" />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}
