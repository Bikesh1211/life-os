"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Stack, Group, Text, Button, Card, SimpleGrid, Badge, Skeleton,
  Timeline, TextInput, Textarea, Modal, ActionIcon, ThemeIcon, Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft, IconArrowUpRight, IconArrowDownRight,
  IconPlus, IconCash, IconTrash, IconAlertTriangle,
} from "@tabler/icons-react";
import dayjs from "dayjs";

interface LoanDetail {
  id: string;
  direction: "lent" | "borrowed";
  principalAmount: string;
  currency: string;
  interestRate: string | null;
  interestType: string;
  totalPayable: string | null;
  loanDate: string;
  dueDate: string | null;
  purpose: string | null;
  notes: string | null;
  status: string;
  isPinned: boolean;
  connectionId: string | null;
  connectionName?: string;
  paidAmount: string;
  remainingAmount: string;
  completionPercentage: number;
  isOverdue: boolean;
}

interface Repayment {
  id: string;
  amount: string;
  date: string;
  paymentMethod: string | null;
  notes: string | null;
  receiptUrl: string | null;
}

interface LoanEvent {
  id: string;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function LoanDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [events, setEvents] = useState<LoanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const [repayAmount, setRepayAmount] = useState("");
  const [repayDate, setRepayDate] = useState<Date>(new Date());
  const [repayMethod, setRepayMethod] = useState("");
  const [repayNotes, setRepayNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [loanRes, repaymentsRes, eventsRes] = await Promise.all([
          fetch(`/api/loans/${id}`),
          fetch(`/api/loans/${id}/repayments`),
          fetch(`/api/loans/${id}/events`),
        ]);

        if (loanRes.ok) setLoan(await loanRes.json());
        if (repaymentsRes.ok) setRepayments(await repaymentsRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAddRepayment = async () => {
    if (!repayAmount) return;
    try {
      const res = await fetch(`/api/loans/${id}/repayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: repayAmount,
          date: repayDate.toISOString(),
          paymentMethod: repayMethod || undefined,
          notes: repayNotes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add repayment");

      notifications.show({ title: "Success", message: "Repayment added", color: "green" });
      close();
      window.location.reload();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "Something went wrong",
        color: "red",
      });
    }
  };

  if (loading) return <Skeleton height={400} radius="lg" />;
  if (!loan) return <Text c="dimmed">Loan not found</Text>;

  const fmt = (n: string | number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: loan.currency,
      maximumFractionDigits: 0,
    }).format(Number(n));

  const statusColor: Record<string, string> = {
    active: "blue",
    partially_paid: "yellow",
    fully_paid: "green",
    cancelled: "gray",
    disputed: "red",
  };

  return (
    <Stack gap="lg">
      <Group>
        <ActionIcon variant="subtle" onClick={() => router.push("/finance/loans")} radius="xl">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <div style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={700} size="xl">{loan.purpose || "Loan"}</Text>
            <Badge color={statusColor[loan.status] || "gray"} variant="light" size="lg">
              {loan.status.replace("_", " ")}
            </Badge>
            {loan.isOverdue && (
              <Badge color="red" variant="light" size="lg" leftSection={<IconAlertTriangle size={12} />}>
                Overdue
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {loan.direction === "lent" ? "You lent" : "You borrowed"} · Created {dayjs(loan.loanDate).format("MMM D, YYYY")}
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Card withBorder radius="lg" padding="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Principal</Text>
          <Text fw={700} size="xl">{fmt(loan.principalAmount)}</Text>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Payable</Text>
          <Text fw={700} size="xl">{fmt(loan.totalPayable || loan.principalAmount)}</Text>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Paid</Text>
          <Text fw={700} size="xl" c="green">{fmt(loan.paidAmount)}</Text>
        </Card>
        <Card withBorder radius="lg" padding="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Remaining</Text>
          <Text fw={700} size="xl" c={Number(loan.remainingAmount) > 0 ? "orange" : "green"}>
            {fmt(loan.remainingAmount)}
          </Text>
        </Card>
      </SimpleGrid>

      {loan.dueDate && (
        <Card withBorder radius="lg" padding="md">
          <Group>
            <ThemeIcon size={36} radius="xl" color="blue" variant="light">
              <IconCash size={18} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>Due Date</Text>
              <Text size="xs" c="dimmed">{dayjs(loan.dueDate).format("MMMM D, YYYY")}</Text>
            </div>
          </Group>
        </Card>
      )}

      <Group justify="space-between">
        <Text fw={600} size="lg">Repayments</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={open} radius="lg" size="sm">
          Add Repayment
        </Button>
      </Group>

      {repayments.length === 0 ? (
        <Card withBorder radius="lg" padding="xl" ta="center">
          <Text c="dimmed">No repayments yet</Text>
        </Card>
      ) : (
        <Stack gap="sm">
          {repayments.map((repayment) => (
            <Card key={repayment.id} withBorder radius="lg" padding="sm">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon size={32} radius="xl" color="green" variant="light">
                    <IconArrowDownRight size={16} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>{fmt(repayment.amount)}</Text>
                    <Text size="xs" c="dimmed">{dayjs(repayment.date).format("MMM D, YYYY")}</Text>
                  </div>
                </Group>
                {repayment.paymentMethod && (
                  <Badge variant="light" size="sm">{repayment.paymentMethod}</Badge>
                )}
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Divider label="Activity Timeline" labelPosition="center" />

      <Timeline active={events.length} bulletSize={24} lineWidth={2}>
        {events.map((event) => (
          <Timeline.Item
            key={event.id}
            title={event.eventType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          >
            <Text size="xs" c="dimmed">{dayjs(event.createdAt).format("MMM D, YYYY h:mm A")}</Text>
          </Timeline.Item>
        ))}
      </Timeline>

      <Modal opened={opened} onClose={close} title="Add Repayment" radius="lg">
        <Stack gap="md">
          <TextInput
            label="Amount"
            placeholder="Enter amount"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.currentTarget.value)}
            radius="lg"
            required
          />
          <DatePickerInput
            label="Date"
            value={repayDate}
            onChange={(val: string | null) => setRepayDate(val ? new Date(val) : new Date())}
            radius="lg"
          />
          <TextInput
            label="Payment Method"
            placeholder="cash, bank_transfer, upi..."
            value={repayMethod}
            onChange={(e) => setRepayMethod(e.currentTarget.value)}
            radius="lg"
          />
          <Textarea
            label="Notes"
            placeholder="Optional notes"
            value={repayNotes}
            onChange={(e) => setRepayNotes(e.currentTarget.value)}
            radius="lg"
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close} radius="lg">Cancel</Button>
            <Button onClick={handleAddRepayment} radius="lg">Add Repayment</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
